package uk.ac.ebi.spot.biosamples;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.solr.repository.config.EnableSolrRepositories;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

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
public class BiosamplesWebConfiguration extends WebMvcConfigurerAdapter {
    @NotNull @Value("${solr.server}")
    private String solrServerUrl;

    @Bean
    public SolrServer solrServer() {
        return new HttpSolrServer(solrServerUrl);
    }

    @Override public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedMethods("GET");
    }
}
