package uk.ac.ebi.spot.biosamples.service;

import uk.ac.ebi.spot.biosamples.exception.HttpSolrQueryBuildingException;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Optional;

public class AutoSuggestSolrQuery implements Cloneable {
    private StringBuilder queryStringBuilder;

    private int defaultSuggestionNumber = 10;

    public AutoSuggestSolrQuery(String solrBaseUrl) {
        this.queryStringBuilder = new StringBuilder();
        queryStringBuilder.append(solrBaseUrl);
    }

    public AutoSuggestSolrQuery(String solrBaseUrl, String solrSearchCoreName) {
        this(solrBaseUrl);
        if (!queryStringBuilder.toString().endsWith("/")) { queryStringBuilder.append("/"); }
        queryStringBuilder.append(solrSearchCoreName);
        queryStringBuilder.append("/");
    }

    public AutoSuggestSolrQuery suggestFor(String term) {
        return suggestFor("term_autosuggest_e",term, Optional.of(defaultSuggestionNumber));
    }

    public AutoSuggestSolrQuery suggestFor(String field, String term) {
        return suggestFor(field,term, Optional.of(defaultSuggestionNumber));
    }

    public AutoSuggestSolrQuery suggestFor(String field, String term, Optional<Integer> optionalNumber) {
        int suggestionNumber = optionalNumber.isPresent() ? optionalNumber.get() : defaultSuggestionNumber;
        queryStringBuilder.append("select?");
        try {
            queryStringBuilder.append("q=")
                    .append(URLEncoder.encode(field, "UTF-8"))
                    .append(":")
                    .append(URLEncoder.encode(String.format("\"%s\"",term), "UTF-8"));
            queryStringBuilder.append("&wt=json");
            queryStringBuilder.append("&rows=").append(suggestionNumber);
//            queryStringBuilder.append("&hl=true");
//            queryStringBuilder.append(String.format("&hl.fl=%s",field));
//            queryStringBuilder.append("&hl.simple.pre=")
//                    .append(URLEncoder.encode("<spanclass='highlight'>", "UTF-8"));
//            queryStringBuilder.append("&hl.simple.post=")
//                    .append(URLEncoder.encode("</span>", "UTF-8"));
        }
        catch (UnsupportedEncodingException e) {
            throw new HttpSolrQueryBuildingException("Failed to set search term", e);
        }
        return this;
    }


    public String stringify() {
        return queryStringBuilder.toString();
    }

    @Override
    public AutoSuggestSolrQuery clone() throws CloneNotSupportedException {
        AutoSuggestSolrQuery clone = (AutoSuggestSolrQuery) super.clone();
        clone.queryStringBuilder = new StringBuilder();
        clone.queryStringBuilder.append(queryStringBuilder.toString());
        return clone;
    }

}
