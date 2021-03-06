package uk.ac.ebi.spot.biosamples;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ResourceLoader;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.data.solr.repository.config.EnableSolrRepositories;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import uk.ac.ebi.spot.biosamples.filter.ResourceAwareUrlRewriteFilter;
import uk.ac.ebi.spot.biosamples.model.neo4j.NeoGroup;
import uk.ac.ebi.spot.biosamples.model.neo4j.NeoSample;
import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.repository.neo4j.NeoSampleRepository;
import uk.ac.ebi.spot.biosamples.repository.solr.SolrSampleRepository;
import uk.ac.ebi.spot.biosamples.service.ApiLinkFactory;

import javax.validation.constraints.NotNull;

@SpringBootApplication
@EnableSolrRepositories(basePackageClasses=SolrSampleRepository.class, multicoreSupport = true)
@EnableNeo4jRepositories(basePackageClasses=NeoSampleRepository.class)
public class BiosamplesWebApplication extends SpringBootServletInitializer {
    @NotNull @Value("${rewrite.filter.name:rewriteFilter}")
    private String rewriteFilterName;

    @NotNull @Value("${rewrite.filter.location:classpath:urlrewrite.xml}")
    private String rewriteFilterResourceLocation;

    @NotNull @Value("${solr.server}")
    private String solrServerUrl;

    
    @Autowired
    private ApiLinkFactory apiLinkFactory;

    public static void main(String[] args) {
        SpringApplication.run(BiosamplesWebApplication.class, args);
    }

    @Bean
    public SolrClient solrClient() {
        return new HttpSolrClient(solrServerUrl);
    }

    @Bean
    public FilterRegistrationBean rewriteFilterConfig(ResourceLoader resourceLoader) {
        FilterRegistrationBean reg = new FilterRegistrationBean();
        reg.setName(rewriteFilterName);
        reg.setFilter(new ResourceAwareUrlRewriteFilter(resourceLoader));
        reg.addInitParameter("confPath", rewriteFilterResourceLocation);
        reg.addInitParameter("confReloadCheckInterval", "-1");
        reg.addInitParameter("statusPath", "/redirect");
        reg.addInitParameter("statusEnabledOnHosts", "*");
        reg.addInitParameter("logLevel", "WARN");
        return reg;
    }
    
    
    //Spring Data REST doesn't support controller annotations or overriding addCorsMappings on WebMvcConfigurerAdapter
    //so we have to do it as a filter instead
    //By default all origins and GET, HEAD, and POST methods are allowed.
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("GET");
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
    

    @Bean
    public ResourceProcessor<Resource<SolrSample>> solrSampleProcessor() {
        return new ResourceProcessor<Resource<SolrSample>>() {
            @Override public Resource<SolrSample> process(Resource<SolrSample> sampleResource) {
                sampleResource.add(apiLinkFactory.createRelationsLinkForSample(sampleResource.getContent()));
                return sampleResource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<SolrGroup>> solrGroupProcessor() {
        return new ResourceProcessor<Resource<SolrGroup>>() {
            @Override public Resource<SolrGroup> process(Resource<SolrGroup> groupResource) {
                groupResource.add(apiLinkFactory.createRelationsLinkForGroup(groupResource.getContent()));
                return groupResource;
            }
        };
    }

    // This function adds a Link to the Sample resource
    @Bean
    public ResourceProcessor<Resource<NeoSample>> sampleProcessor() {
        return new ResourceProcessor<Resource<NeoSample>>() {
            @Override
            public Resource<NeoSample> process(Resource<NeoSample> sampleResource) {
                sampleResource.add(apiLinkFactory.createDetailsLinkForSample(sampleResource.getContent()));
                //sampleResource.add(new Link(sampleResource.getLink("self").getHref() + "/graph", "graph"));
                return sampleResource;
            }
        };
    }
    
    //This function adds a Link to the Group resource
    @Bean
    public ResourceProcessor<Resource<NeoGroup>> groupProcessor() {
        return new ResourceProcessor<Resource<NeoGroup>>() {
            @Override
            public Resource<NeoGroup> process(Resource<NeoGroup> groupResource) {
                groupResource.add(apiLinkFactory.createDetailsLinkForGroup(groupResource.getContent()));
                //groupResource.add(new Link(groupResource.getLink("self").getHref() + "/graph", "graph"));
                return groupResource;
            }
        };
    }

}
