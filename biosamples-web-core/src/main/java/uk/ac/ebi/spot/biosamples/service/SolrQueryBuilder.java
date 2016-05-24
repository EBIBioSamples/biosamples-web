package uk.ac.ebi.spot.biosamples.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 29/04/16
 */
@Component
public class SolrQueryBuilder {
    @Value("${solr.server}")
    private String solrBaseUrl;

    @Value("${solr.server.search.core-name}")
    private String solrSearchCoreName;

    public SolrQueryBuilder() {
    }

    public SolrQueryBuilder(String solrBaseUrl) {
        this.solrBaseUrl = solrBaseUrl;
    }

    public SolrQueryBuilder(String solrBaseUrl, String solrSearchCoreName) {
        this.solrBaseUrl = solrBaseUrl;
        this.solrSearchCoreName = solrSearchCoreName;
    }

    public HttpSolrQuery createQuery(String query) {
        HttpSolrQuery q = solrSearchCoreName == null ? new HttpSolrQuery(solrBaseUrl) : new HttpSolrQuery(solrBaseUrl, solrSearchCoreName);
        return q.searchFor(query);
    }

    public HttpSolrQuery createQuery(String field, String query) {
        HttpSolrQuery q = solrSearchCoreName == null ? new HttpSolrQuery(solrBaseUrl) : new HttpSolrQuery(solrBaseUrl, solrSearchCoreName);
        return q.searchFor(field, query);
    }
}
