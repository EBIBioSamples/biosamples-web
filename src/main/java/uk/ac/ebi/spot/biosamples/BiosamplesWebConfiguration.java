package uk.ac.ebi.spot.biosamples;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.data.solr.core.SolrOperations;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.repository.config.EnableSolrRepositories;
import org.springframework.data.solr.server.support.HttpSolrServerFactoryBean;

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
    private String solrServerUrl;

    @Bean
//    @Scope("prototype")
    public SolrServer solrServer() {
        return new HttpSolrServer(solrServerUrl);
    }

    @Bean
    public SolrOperations mergedCoreSolrTemplate() throws Exception {
        HttpSolrServer httpSolrServer = new HttpSolrServer(solrServerUrl);
        return new SolrTemplate(httpSolrServer,"merged");
//        return new SolrTemplate(solrServer(),"merged"); // Use this ONLY if you set solrServer @Scope annotation to prototype
    }



}
