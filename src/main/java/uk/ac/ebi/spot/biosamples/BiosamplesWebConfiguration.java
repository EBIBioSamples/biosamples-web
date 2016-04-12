package uk.ac.ebi.spot.biosamples;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.solr.core.SolrOperations;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.repository.config.EnableSolrRepositories;

import javax.validation.constraints.NotNull;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
@Configuration
@EnableAutoConfiguration
@EnableSolrRepositories(multicoreSupport = true)
public class BiosamplesWebConfiguration {
    @NotNull @Value("${solr.server}")
    private String solrServer;

    @Bean (name = "solrServer")
    public SolrServer getSolrServer() {
        return new HttpSolrServer(solrServer);
    }


    @Bean
    public SolrOperations getMergedSolrTemplate() {

        return new SolrTemplate(getSolrServer(),"merged");
    }


}
