package uk.ac.ebi.spot.biosamples.service;

import uk.ac.ebi.spot.biosamples.exception.HttpSolrQueryBuildingException;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

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
    private boolean highlightingEnabled = false;

    HttpSolrQuery(String solrBaseUrl) {
        this.queryStringBuilder = new StringBuilder();
        queryStringBuilder.append(solrBaseUrl);
    }

    HttpSolrQuery(String solrBaseUrl, String solrSearchCoreName) {
        this.queryStringBuilder = new StringBuilder();
        queryStringBuilder.append(solrBaseUrl);
        if (!queryStringBuilder.toString().endsWith("/")) queryStringBuilder.append("/");
        queryStringBuilder.append(solrSearchCoreName);
        queryStringBuilder.append("/");
    }

    public HttpSolrQuery searchFor(String term) {
        if (capturedTerm) throw new HttpSolrQueryBuildingException("Invalid query - search term already added");
        queryStringBuilder.append("select?");
        queryStringBuilder.append("q=").append(term);
        capturedTerm = true;
        return this;
    }

    public HttpSolrQuery searchFor(String field, String term) {
        if (capturedTerm) throw new HttpSolrQueryBuildingException("Invalid query - search term already added");
        queryStringBuilder.append("select?");
        queryStringBuilder.append("q=").append(field).append(":").append(term);
        capturedTerm = true;
        return this;
    }

    public HttpSolrQuery withContentType(CONTENT_TYPE contentType) {
        queryStringBuilder.append("&wt=");
        if (contentType.equals(CONTENT_TYPE.JSON)) {
            queryStringBuilder.append("json");
        }
        else {
            queryStringBuilder.append("xml");
        }
        return this;
    }

    public HttpSolrQuery withFacetOn(String... facetFields) {
        if (!facetsEnabled) {
            queryStringBuilder.append("&facet=true");
            facetsEnabled = true;
        }

        for (String ff : facetFields) {
            queryStringBuilder.append("&facet.field=").append(ff);
        }
        return this;
    }

    public HttpSolrQuery withFacetOn(int facetLimit, String... facetFields) {
        if (!facetsEnabled) {
            queryStringBuilder.append("&facet=true");
            facetsEnabled = true;
        }

        for (String ff : facetFields) {
            queryStringBuilder.append("&facet.field=").append(ff);
        }

        return withFacetLimit(facetLimit);
    }

    public HttpSolrQuery withFacetLimit(int facetLimit) {
        if (facetLimitEnabled) throw new HttpSolrQueryBuildingException("Facet limit has already been set");
        queryStringBuilder.append("&facet.limit=").append(facetLimit);
        facetLimitEnabled = true;
        return this;
    }

    public HttpSolrQuery withFilterOn(String filterField, String filterValue) {
        queryStringBuilder.append("&fq=").append(filterField).append(":").append(filterValue);
        return this;
    }

    public HttpSolrQuery withPage(int start, int rows) {
        if (!capturedTerm) throw new HttpSolrQueryBuildingException("Please add search term before adding configuration");
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

    public enum CONTENT_TYPE {
        JSON,
        XML
    }

    @Override public HttpSolrQuery clone() throws CloneNotSupportedException {
        HttpSolrQuery clone = (HttpSolrQuery)super.clone();
        clone.queryStringBuilder = new StringBuilder();
        clone.queryStringBuilder.append(queryStringBuilder.toString());
        return clone;
    }
}
