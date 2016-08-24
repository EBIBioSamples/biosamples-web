package uk.ac.ebi.spot.biosamples.service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import uk.ac.ebi.spot.biosamples.exception.HttpSolrQueryBuildingException;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 29/04/16
 */
public class HttpSolrQuery implements Cloneable {
    private StringBuilder queryStringBuilder;

    private boolean capturedTerm = false;
    private boolean facetsEnabled = false;
    private boolean facetLimitEnabled = false;
    private boolean facetMinCountEnabled = false;
    private boolean highlightingEnabled = false;

    private final Set<String> filteredFields;

    public HttpSolrQuery(String solrBaseUrl) {
        this.filteredFields = new HashSet<>();
        this.queryStringBuilder = new StringBuilder();
        queryStringBuilder.append(solrBaseUrl);
    }

    public HttpSolrQuery(String solrBaseUrl, String solrSearchCoreName) {
        this(solrBaseUrl);
        if (!queryStringBuilder.toString().endsWith("/")) { queryStringBuilder.append("/"); }
        queryStringBuilder.append(solrSearchCoreName);
        queryStringBuilder.append("/");
    }

    public Set<String> getFilteredFields() {
        return Collections.unmodifiableSet(filteredFields);
    }

    public HttpSolrQuery searchFor(String term) {
        if (capturedTerm) { throw new HttpSolrQueryBuildingException("Invalid query - search term already added"); }
        queryStringBuilder.append("search?");
        try {
            queryStringBuilder.append("q=").append(URLEncoder.encode(term, "UTF-8"));
            capturedTerm = true;
            return this;
        }
        catch (UnsupportedEncodingException e) {
            throw new HttpSolrQueryBuildingException("Failed to set search term", e);
        }
    }

    public HttpSolrQuery searchFor(String field, String term) {
        if (capturedTerm) { throw new HttpSolrQueryBuildingException("Invalid query - search term already added"); }
        queryStringBuilder.append("search?");
        try {
            queryStringBuilder.append("q=")
                    .append(URLEncoder.encode(field, "UTF-8"))
                    .append(":")
                    .append(URLEncoder.encode(String.format("\"%s\"",term), "UTF-8"));
            capturedTerm = true;
            return this;
        }
        catch (UnsupportedEncodingException e) {
            throw new HttpSolrQueryBuildingException("Failed to set search term", e);
        }
    }

    public HttpSolrQuery withContentType(CONTENT_TYPE contentType) {
        queryStringBuilder.append("&wt=");
        if (contentType.equals(CONTENT_TYPE.JSON)) {
            queryStringBuilder.append("json");
        }
        else if (contentType.equals(CONTENT_TYPE.XML)) {
            queryStringBuilder.append("xml");
        }
        else {
            throw new IllegalArgumentException("ContentType must be a valid constant");
        }

        return this;
    }

    public HttpSolrQuery withFacetOn(String... facetFields) {
        if (!facetsEnabled) {
            queryStringBuilder.append("&facet=true");
            facetsEnabled = true;
        }

        for (String ff : facetFields) {
            try {
                queryStringBuilder.append("&facet.field=").append(URLEncoder.encode(ff, "UTF-8"));
            }
            catch (UnsupportedEncodingException e) {
                throw new HttpSolrQueryBuildingException("Failed to set facet arguments", e);
            }
        }
        return this;
    }

    public HttpSolrQuery withFacetOn(int facetLimit, String... facetFields) {
        return withFacetOn(facetFields).withFacetLimit(facetLimit);
    }

    public HttpSolrQuery withFacetLimit(int facetLimit) {
        if (facetLimitEnabled) { throw new HttpSolrQueryBuildingException("Facet limit has already been set"); }
        queryStringBuilder.append("&facet.limit=").append(facetLimit);
        facetLimitEnabled = true;
        return this;
    }

    public HttpSolrQuery withFacetMinCount(int facetMinCount) {
        if (facetMinCountEnabled) {
            throw new HttpSolrQueryBuildingException("Facet minimum count has already been set");
        }
        queryStringBuilder.append("&facet.mincount=").append(facetMinCount);
        facetMinCountEnabled = true;
        return this;
    }

    public HttpSolrQuery withFilterOn(String filterField, String filterValue) {
        try {
            filteredFields.add(filterField);
            queryStringBuilder.append("&fq=")
                    .append(URLEncoder.encode(filterField, "UTF-8"))
                    .append(":")
                    .append(URLEncoder.encode(String.format("\"%s\"",filterValue), "UTF-8"));
        }
        catch (UnsupportedEncodingException e) {
            throw new HttpSolrQueryBuildingException("Failed to set filter arguments", e);
        }
        return this;
    }

    public HttpSolrQuery withPage(int start, int rows) {
        if (!capturedTerm) {
            throw new HttpSolrQueryBuildingException("Please add search term before adding configuration");
        }
        queryStringBuilder.append("&start=").append(start);
        queryStringBuilder.append("&rows=").append(rows);
        return this;
    }

    public HttpSolrQuery withHighlighting(String... highlitFields) {
        if (!highlightingEnabled) {
            queryStringBuilder.append("&hl=true");
            queryStringBuilder.append("&hl=true");
            queryStringBuilder.append("&hl.fragsize=0");
            try {
                queryStringBuilder.append("&hl.simple.pre=")
                        .append(URLEncoder.encode("<spanclass='highlight'>", "UTF-8"));
                queryStringBuilder.append("&hl.simple.post=")
                        .append(URLEncoder.encode("</span>", "UTF-8"));
            }
            catch (UnsupportedEncodingException e) {
                throw new HttpSolrQueryBuildingException("Failed to set highlighting parameters", e);
            }
            highlightingEnabled = true;
        }
        for (String highlitField : highlitFields) {
            queryStringBuilder.append("&hl.fl=").append(highlitField);
        }
        return this;
    }

    public String stringify() {
        return queryStringBuilder.toString();
    }

    public static enum CONTENT_TYPE {
        JSON,
        XML
    }

    @Override
    public HttpSolrQuery clone() throws CloneNotSupportedException {
        HttpSolrQuery clone = (HttpSolrQuery) super.clone();
        clone.queryStringBuilder = new StringBuilder();
        clone.queryStringBuilder.append(queryStringBuilder.toString());
        return clone;
    }

    public HttpSolrQuery getGroupSamplesCharacteristics(String groupAccession) {
        if (!groupAccession.matches("SAMEG\\d+"))
            { throw new HttpSolrQueryBuildingException("Invalid query - provided accession is not for a group"); }

        queryStringBuilder.append("crt/groupsamples?");
        try {
            queryStringBuilder.append("q=").append(URLEncoder.encode(groupAccession, "UTF-8"));
            this.capturedTerm = true;
            return this;
        }
        catch (UnsupportedEncodingException e) {
            throw new HttpSolrQueryBuildingException("Failed to set group samples characteristics query", e);
        }
    }
}
