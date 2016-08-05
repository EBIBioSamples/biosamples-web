package uk.ac.ebi.spot.biosamples;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ResourceLoader;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import uk.ac.ebi.spot.biosamples.filter.ResourceAwareUrlRewriteFilter;
import uk.ac.ebi.spot.biosamples.model.solr.Group;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;
import uk.ac.ebi.spot.biosamples.service.RelationsLinkFactory;

import javax.validation.constraints.NotNull;

@SpringBootApplication
public class BiosamplesWebApplication {
    @NotNull @Value("${rewrite.filter.name:rewriteFilter}")
    private String rewriteFilterName;

    @NotNull @Value("${rewrite.filter.location:classpath:urlrewrite.xml}")
    private String rewriteFilterResourceLocation;

    @NotNull @Value("${solr.server}")
    private String solrServerUrl;

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
    public ResourceProcessor<Resource<Sample>> sampleProcessor() {
        return new ResourceProcessor<Resource<Sample>>() {
            @Override public Resource<Sample> process(Resource<Sample> sampleResource) {
                sampleResource.add(relationsLinkFactory.createRelationsLinkForSample(sampleResource.getContent()));
                return sampleResource;
            }
        };
    }

    @Bean
    public ResourceProcessor<Resource<Group>> groupProcessor() {
        return new ResourceProcessor<Resource<Group>>() {
            @Override public Resource<Group> process(Resource<Group> groupResource) {
                groupResource.add(relationsLinkFactory.createRelationsLinkForGroup(groupResource.getContent()));
                return groupResource;
            }
        };
    }

}
