package uk.ac.ebi.spot.biosamples.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 29/04/16
 */
@Service
public class HttpSolrDispatcher {
    private final Logger log = LoggerFactory.getLogger(getClass());

    protected Logger getLog() {
        return log;
    }

    @Value("classpath:ignoredFacets.fields")
    private Resource ignoredFacetsResource;

    @Autowired
    private SolrQueryBuilder solrQueryBuilder;

    private Set<String> ignoredFacets;

    @PostConstruct
    private void readIgnoredFacet() {
        ignoredFacets = new HashSet<>();
        ignoredFacets.add("content_type"); // content_type is always returned as facet
        
        if (ignoredFacetsResource != null && ignoredFacetsResource.exists()) {

	        Pattern pattern = Pattern.compile("^(\\w+)\\s*(?:#.*)?$");
	        try {
	            BufferedReader br = new BufferedReader(new InputStreamReader(ignoredFacetsResource.getInputStream()));
	            String line = br.readLine();
	            while (line != null) {
	                Matcher matcher = pattern.matcher(line);
	                if (matcher.find()) {
	                    ignoredFacets.add(matcher.group(1).trim());
	                }
	                line = br.readLine();
	            }
	            br.close();
	        }
	        catch (IOException e) {
	            e.printStackTrace();
	            ignoredFacets.add("content_type");
	        }
        }
    }

    public Map<String,List<String>> getGroupCommonAttributes(String groupAccession, int facetCount) {

        HttpSolrQuery commonFacetQuery = solrQueryBuilder
                .createQuery("sample_grp_accessions",groupAccession);

        commonFacetQuery.withPage(0,0);
        commonFacetQuery.withFacetOn("crt_type_ft");
        commonFacetQuery.withFacetMinCount(facetCount);

        String[] possibleAttributes = executeAndParseFacetQuery(commonFacetQuery);

        HttpSolrQuery commonAttrQuery = solrQueryBuilder
                .createQuery("sample_grp_accessions",groupAccession);

        commonAttrQuery.withPage(0,0);
        for(String attribute: possibleAttributes) {
            commonAttrQuery.withFacetOn(attribute);
        }
        commonAttrQuery.withFacetMinCount(facetCount);
        return executeAndParseCommonAttributeQuery(commonAttrQuery);
    }



    public String[] getMostUsedFacets(HttpSolrQuery solrQuery, int facetLimit) {
        try {
            HttpSolrQuery facetQuery = solrQuery.clone();
            int safeFacetLimit = ignoredFacets.size() - 1 + facetLimit;

            // we don't need any results here
            facetQuery.withPage(0,0);

            // and we are investigating crt_type_ft
            facetQuery.withFacetOn("crt_type_ft");
            facetQuery.withFacetLimit(safeFacetLimit);

            return reduceFacetsNumber(executeAndParseFacetQuery(facetQuery),facetLimit);
        }
        catch (CloneNotSupportedException e) {
            throw new RuntimeException("Unexpected exception cloning query to determine most used attributes", e);
        }
    }

    private String[] reduceFacetsNumber(String[] facetsList, int facetLimit) {
        if ( facetsList.length  < facetLimit) {
            return facetsList;
        }
        String[] reducedFacetList = new String[facetLimit];
        System.arraycopy(facetsList, 0, reducedFacetList, 0, facetLimit);
        return reducedFacetList;
    }

    public void streamSolrResponse(OutputStream outputStream, HttpSolrQuery solrQuery) throws IOException {
        String requestUrl = solrQuery.stringify();
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet getRequest = new HttpGet(requestUrl);
        try (CloseableHttpResponse httpResponse = httpClient.execute(getRequest)) {
            HttpEntity entity = httpResponse.getEntity();
            entity.writeTo(outputStream);
            EntityUtils.consume(entity);
        }
    }

    private String[] executeAndParseFacetQuery(HttpSolrQuery facetQuery) {
        try {
            final PipedInputStream in = new PipedInputStream();
            final PipedOutputStream out = new PipedOutputStream(in);

            ExecutorService singleExecutor = Executors.newSingleThreadExecutor();
            Future<String[]> fResult = singleExecutor.submit(() -> {
                List<String> dynamicFacets = new ArrayList<>();
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(in);
                JsonNode facetCounts = jsonNode.get("facet_counts");
                if (facetCounts == null) {
                    throw new RuntimeException("Unexpected Solr response - no facet_counts field");
                }
                JsonNode facetFields = facetCounts.get("facet_fields");
                if (facetFields == null) {
                    throw new RuntimeException("Unexpected Solr response - no facet_fields field");
                }
                JsonNode facetNodes = facetFields.get("crt_type_ft");
                if (facetNodes == null) {
                    throw new RuntimeException("Unexpected Solr response - no crt_type_ft field");
                }
                Iterator<JsonNode> facetNodeIt = facetNodes.elements();
                while (facetNodeIt.hasNext()) {
                    String facetName = facetNodeIt.next().asText();
                    int facetCount = facetNodeIt.next().asInt();
                    if (!ignoredFacets.contains(facetName)) {
                        getLog().debug("Dynamic facet '" + facetName + "' -> " + facetCount);
                        dynamicFacets.add(String.format("%s_ft", facetName));
                    }
                }
                return dynamicFacets.toArray(new String[dynamicFacets.size()]);
            });
            streamSolrResponse(out, facetQuery);

            long timeout = 60;
            try {
                String[] result = fResult.get(timeout, TimeUnit.SECONDS);
                singleExecutor.shutdown();
                return result;
            }
            catch (TimeoutException e) {
                throw new RuntimeException("No Solr response acquired in " + timeout + "s.");
            }
        }
        catch (InterruptedException e) {
            throw new RuntimeException("Solr parsing thread was interrupted", e);
        }
        catch (ExecutionException e) {
            throw new RuntimeException("Execution of Solr parsing thread failed", e);
        }
        catch (IOException e) {
            throw new RuntimeException("Unable to calculate most commonly used facets", e);
        }
    }

    //TODO: should I suppose attrQuery has everything I need to get the correct attributes - No check here?
    private Map<String,List<String>> executeAndParseCommonAttributeQuery(HttpSolrQuery attrQuery) {
        try {
            final PipedInputStream in = new PipedInputStream();
            final PipedOutputStream out = new PipedOutputStream(in);

            ExecutorService singleExecutor = Executors.newSingleThreadExecutor();
            Future<Map<String,List<String>>> ftResults = singleExecutor.submit(() -> {
                Map<String, List<String>> commonAttributes = new HashMap();
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(in);
                JsonNode facetCounts = jsonNode.get("facet_counts");
                if (facetCounts == null) {
                    throw new RuntimeException("Unexpected Solr response - no facet_counts field");
                }
                JsonNode facetFields = facetCounts.get("facet_fields");
                if (facetFields == null) {
                    throw new RuntimeException("Unexpected Solr response - no facet_fields field");
                }
                Iterator<String> fieldNamesIt = facetFields.fieldNames();
                while(fieldNamesIt.hasNext()) {
                    String fieldName = fieldNamesIt.next();
                    JsonNode fieldValue = facetFields.get(fieldName);
                    List<String> fieldCommonValues = new ArrayList<>();
                    Iterator<JsonNode> fieldValueIt = fieldValue.elements();
                    while(fieldValueIt.hasNext()) {
                        String attrName = fieldValueIt.next().asText();
                        int attrCount = fieldValueIt.next().asInt();
                        fieldCommonValues.add(attrName);
                    }
                    commonAttributes.put(fieldName,fieldCommonValues);
                }
                return commonAttributes;
            });

            streamSolrResponse(out, attrQuery);

            long timeout = 600;
            try {
                Map<String,List<String>> results = ftResults.get(timeout, TimeUnit.SECONDS);
                singleExecutor.shutdown();
                return results;
            }  catch (TimeoutException e) {
                throw new RuntimeException("No Solr response acquired in " + timeout + "s.");
            }
        } catch (InterruptedException e) {
                throw new RuntimeException("Solr parsing thread was interrupted", e);
        } catch (ExecutionException e) {
                throw new RuntimeException("Execution of Solr parsing thread failed", e);
        } catch (IOException e) {
            throw new RuntimeException("Unable to calculate most commonly used facets", e);
        }
    }

}
