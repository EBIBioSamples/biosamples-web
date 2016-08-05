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
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;

import uk.ac.ebi.spot.biosamples.filter.ResourceAwareUrlRewriteFilter;
import uk.ac.ebi.spot.biosamples.model.ne4j.Group;
import uk.ac.ebi.spot.biosamples.model.ne4j.Sample;
import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.service.ApiLinkFactory;
import uk.ac.ebi.spot.biosamples.service.RelationsLinkFactory;

import javax.validation.constraints.NotNull;

@SpringBootApplication
public class BiosamplesWebApplication extends SpringBootServletInitializer {
    @NotNull @Value("${rewrite.filter.name:rewriteFilter}")
    private String rewriteFilterName;

    @NotNull @Value("${rewrite.filter.location:classpath:urlrewrite.xml}")
    private String rewriteFilterResourceLocation;

    @NotNull @Value("${solr.server}")
    private String solrServerUrl;

    
    @Autowired
    private ApiLinkFactory apiLinkFactory;
    
    @Autowired
    private RelationsLinkFactory relationsLinkFactory;

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

    @Bean
    public ResourceProcessor<Resource<SolrSample>> solrSampleProcessor() {
        return new ResourceProcessor<Resource<SolrSample>>() {
            @Override public Resource<SolrSample> process(Resource<SolrSample> sampleResource) {
                sampleResource.add(relationsLinkFactory.createRelationsLinkForSample(sampleResource.getContent()));
                return sampleResource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<SolrGroup>> solrGroupProcessor() {
        return new ResourceProcessor<Resource<SolrGroup>>() {
            @Override public Resource<SolrGroup> process(Resource<SolrGroup> groupResource) {
                groupResource.add(relationsLinkFactory.createRelationsLinkForGroup(groupResource.getContent()));
                return groupResource;
            }
        };
    }

    // This function adds a Link to the Sample resource
    @Bean
    public ResourceProcessor<Resource<Sample>> sampleProcessor() {
        return new ResourceProcessor<Resource<Sample>>() {
            @Override
            public Resource<Sample> process(Resource<Sample> sampleResource) {
                sampleResource.add(apiLinkFactory.createApiLinkForSample(sampleResource.getContent()));
                sampleResource.add(new Link(sampleResource.getLink("self").getHref() + "/graph", "graph"));
                return sampleResource;
            }
        };
    }
    
    //This function adds a Link to the Group resource
    @Bean
    public ResourceProcessor<Resource<Group>> groupProcessor() {
        return new ResourceProcessor<Resource<Group>>() {
            @Override
            public Resource<Group> process(Resource<Group> groupResource) {
                groupResource.add(apiLinkFactory.createApiLinkForGroup(groupResource.getContent()));
                groupResource.add(new Link(groupResource.getLink("self").getHref() + "/graph", "graph"));
                return groupResource;
            }
        };
    }

}
