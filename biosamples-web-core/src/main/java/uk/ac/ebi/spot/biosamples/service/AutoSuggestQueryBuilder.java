package uk.ac.ebi.spot.biosamples.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AutoSuggestQueryBuilder {
    @Value("${solr.server}")
    private String solrBaseUrl;

    @Value("${solr.server.autosuggest.core-name}")
    private String solrSearchCoreName;

    public AutoSuggestQueryBuilder() {
    }

    public AutoSuggestQueryBuilder(String solrBaseUrl) {
        this.solrBaseUrl = solrBaseUrl;
    }

    public AutoSuggestQueryBuilder(String solrBaseUrl, String solrSearchCoreName) {
        this.solrBaseUrl = solrBaseUrl;
        this.solrSearchCoreName = solrSearchCoreName;
    }

    public AutoSuggestSolrQuery createQuery(String query) {
        AutoSuggestSolrQuery q = solrSearchCoreName == null ? new AutoSuggestSolrQuery(solrBaseUrl) : new AutoSuggestSolrQuery(solrBaseUrl, solrSearchCoreName);
        return q.suggestFor(query);
    }

    public AutoSuggestSolrQuery createQuery(String field, String query) {
        AutoSuggestSolrQuery q = solrSearchCoreName == null ? new AutoSuggestSolrQuery(solrBaseUrl) : new AutoSuggestSolrQuery(solrBaseUrl, solrSearchCoreName);
        return q.suggestFor(field, query);
    }
}
