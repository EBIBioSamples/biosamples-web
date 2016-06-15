package uk.ac.ebi.spot.biosamples;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;
import uk.ac.ebi.spot.biosamples.model.solr.Group;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;
import uk.ac.ebi.spot.biosamples.service.RelationsLinkFactory;

import javax.validation.constraints.NotNull;

@SpringBootApplication
public class BiosamplesWebApplication {
    public static final String REWRITE_FILTER_NAME = "rewriteFilter";
    public static final String REWRITE_FILTER_CONF_PATH = "urlrewrite.xml";

    @NotNull @Value("${solr.server}")
    private String solrServerUrl;

    @Autowired
    private RelationsLinkFactory relationsLinkFactory;

    public static void main(String[] args) {
        SpringApplication.run(BiosamplesWebApplication.class, args);
    }

    @Bean
    public SolrServer solrServer() {
        return new HttpSolrServer(solrServerUrl);
    }

    @Bean
    public FilterRegistrationBean rewriteFilterConfig() {
        FilterRegistrationBean reg = new FilterRegistrationBean();
        reg.setName(REWRITE_FILTER_NAME);
        reg.setFilter(new UrlRewriteFilter());
        reg.addInitParameter("confPath", REWRITE_FILTER_CONF_PATH);
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
