package uk.ac.ebi.spot.biosamples;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.validation.constraints.NotNull;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
@Configuration
@EnableAutoConfiguration
public class BiosamplesWebConfiguration {
    @NotNull @Value("${solr.server}")
    private String solrServer;

    @Bean SolrServer solrServer() {
        return new HttpSolrServer(solrServer);
    }

//    @Bean RepositoryRestConfigurerAdapter repositoryRestConfigurerAdapter() {
//        return new RepositoryRestConfigurerAdapter() {
//            @Override public void configureJacksonObjectMapper(ObjectMapper objectMapper) {
//                objectMapper.registerModule(new SimpleModule("SampleCharacteristicsModule") {
//                    @Override public void setupModule(SetupContext context) {
//                        SimpleSerializers serializers = new SimpleSerializers();
//                        SimpleDeserializers deserializers = new SimpleDeserializers();
//
//                        serializers.addSerializer(Sample.class, new SampleSerializer());
//                        deserializers.addDeserializer(Sample.class, new SampleDeserializer());
//
//                        context.addSerializers(serializers);
//                        context.addDeserializers(deserializers);
//                    }
//                });
//            }
//        };
//    }
}
