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
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class HttpSolrDispatcher {
    private final Logger log = LoggerFactory.getLogger(getClass());

    protected Logger getLog() {
        return log;
    }

    @Value("${solr.ignoredfacets.file}")
    private String ignoredFacetsFilename;

    @Value("${solr.includedfacets.file}")
    private String includedFacetsFilename;

    @Autowired
    private SolrQueryBuilder solrQueryBuilder;
    
    @Autowired
    private ApplicationContext ctx;

    private LinkedHashSet<String> ignoredFacets = new LinkedHashSet<>();
    private LinkedHashSet<String> includedFacets = new LinkedHashSet<>();

    @PostConstruct
    private void readFacetsFiles() {
        ignoredFacets.add("content_type"); // content_type is always returned as facet

        // Ignored facets
        if ( ignoredFacetsFilename != null ) {
            log.info("Looking for ignored facets file at " + ignoredFacetsFilename);
            Set<String> resourceContent = readFacetsFromFile(ignoredFacetsFilename);
            for (String ignoredFacet : resourceContent) {
                ignoredFacets.add(ignoredFacet);
            }

            for (String facet : ignoredFacets) {
                log.info("Ignoring facet " + facet);
            }
        }

        // Mandatory facets
        if ( includedFacetsFilename != null ) {
            log.info("Looking for mandatory facets file at " + includedFacetsFilename);
            includedFacets = readFacetsFromFile(includedFacetsFilename);
            for (String facet : includedFacets) {
                log.info("Always considering facet " + facet);
            }
        }

    }

    private LinkedHashSet<String> readFacetsFromFile(String filename) {
        Resource facetResource = ctx.getResource(filename);
        LinkedHashSet<String> facets = new LinkedHashSet<>();
        if (facetResource != null && facetResource.exists()) {

            Pattern pattern = Pattern.compile("^(\\w+)\\s*(?:#.*)?$");
            try {
                BufferedReader br = new BufferedReader(new InputStreamReader(facetResource.getInputStream()));
                String line = br.readLine();
                while (line != null) {
                    Matcher matcher = pattern.matcher(line);
                    if (matcher.find()) {
                        String facetName = matcher.group(1).trim();
                        facets.add(facetName + "_facet");
                    }
                    line = br.readLine();
                }
                br.close();
            }
            catch (IOException e) {
                log.error("Unable to read facet resource", e);
                throw new RuntimeException(e);
            }
        } else {
            log.info("did not find facetResource", facetResource);
            throw new RuntimeException("The provided file has not been found " + filename);
        }
        return facets;
    }

    public Set<String> getGroupCommonAttributes(String groupAccession, int facetCount) {

        HttpSolrQuery commonFacetQuery = solrQueryBuilder
                .createQuery("sample_grp_accessions", groupAccession);

        commonFacetQuery.withPage(0, 0);
        commonFacetQuery.withFacetOn("crt_type_facet");
        commonFacetQuery.withFacetMinCount(facetCount);

        String[] possibleAttributes = executeAndParseFacetQuery(commonFacetQuery,
                Collections.emptySet(), Collections.emptySet());

        HttpSolrQuery commonAttrQuery = solrQueryBuilder
                .createQuery("sample_grp_accessions", groupAccession);

        commonAttrQuery.withPage(0, 0);
        for (String attribute : possibleAttributes) {
            commonAttrQuery.withFacetOn(attribute);
        }
        commonAttrQuery.withFacetMinCount(facetCount);
        return executeAndParseCommonAttributeQuery(commonAttrQuery);
    }

    public Set<String> getGroupSamplesAttributes(String groupAccession) {
        HttpSolrQuery groupSamplesAttributesQuery =
                solrQueryBuilder.createGroupSampleCharateristicsQuery(groupAccession);

        groupSamplesAttributesQuery.withPage(0,0);

        String[] groupSamplesAttributes = executeAndParseFacetQuery(groupSamplesAttributesQuery,
                Collections.emptySet(), Collections.emptySet());

        return Arrays.stream(groupSamplesAttributes).collect(Collectors.toSet());
    }

    public String[] getMostUsedFacets(HttpSolrQuery solrQuery, int facetLimit) {
        try {
            HttpSolrQuery facetQuery = solrQuery.clone();

            // build the set of facets to exclude
            final Set<String> excludedFacetsForQuery = new LinkedHashSet<>();
            excludedFacetsForQuery.addAll(ignoredFacets);
            excludedFacetsForQuery.addAll(facetQuery.getFilteredFields());
            int facetLimitForQuery = excludedFacetsForQuery.size() + facetLimit;

            final Set<String> includedFacetsForQuery = new LinkedHashSet<>();
            includedFacetsForQuery.addAll(includedFacets);
            // we don't need any results here
            facetQuery.withPage(0, 0);

            // and we are investigating crt_type_ft
            facetQuery.withFacetOn("crt_type_facet");
            // TODO Probably not the most elegant solution
            for(String facet: includedFacets) {
                facetQuery.withCustomFacetOn(facet, 
                        "facet.limit=2");
            }

            facetQuery.withFacetMinCount(1);
            facetQuery.withFacetLimit(facetLimitForQuery);

            return reduceFacetsNumber(executeAndParseFacetQuery(facetQuery,
                    excludedFacetsForQuery,
                    includedFacetsForQuery),
                    facetLimit);
        }
        catch (CloneNotSupportedException e) {
            throw new RuntimeException("Unexpected exception cloning query to determine most used attributes", e);
        }
    }

    private String[] reduceFacetsNumber(String[] facetsList, int facetLimit) {
        if (facetsList.length < facetLimit) {
            return facetsList;
        }
        String[] reducedFacetList = new String[facetLimit];
        System.arraycopy(facetsList, 0, reducedFacetList, 0, facetLimit);
        return reducedFacetList;
    }

    public void streamSolrResponse(OutputStream outputStream, HttpSolrQuery solrQuery) throws IOException {
    	log.info("Getting solrReponse for "+solrQuery.stringify());
    	
        String requestUrl = solrQuery.stringify();
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet getRequest = new HttpGet(requestUrl);
        try (CloseableHttpResponse httpResponse = httpClient.execute(getRequest)) {
            HttpEntity entity = httpResponse.getEntity();
            entity.writeTo(outputStream);
            EntityUtils.consume(entity);
        }
    }

    public void streamSolrResponse(OutputStream outputStream, AutoSuggestSolrQuery solrQuery) throws IOException {
        String requestUrl = solrQuery.stringify();
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet getRequest = new HttpGet(requestUrl);
        try (CloseableHttpResponse httpResponse = httpClient.execute(getRequest)) {
            HttpEntity entity = httpResponse.getEntity();
            entity.writeTo(outputStream);
            EntityUtils.consume(entity);
        }
    }

    private String[] executeAndParseFacetQuery(HttpSolrQuery facetQuery,
                                               Collection<String> excludedFacets,
                                               Collection<String> includedFacets) {

        try (final PipedInputStream in = new PipedInputStream();
        		final PipedOutputStream out = new PipedOutputStream(in)) {

            ExecutorService singleExecutor = Executors.newSingleThreadExecutor();
            Future<String[]> fResult = singleExecutor.submit(() -> {
                List<String> dynamicFacets = new ArrayList<>();
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(in);
                JsonNode facetCounts = jsonNode.get("facet_counts");
                if (facetCounts == null) {
                	log.error("Unexpected Solr response - no facet_counts field "+facetQuery.stringify());
                    throw new RuntimeException("Unexpected Solr response - no facet_counts field");
                }
                JsonNode facetFields = facetCounts.get("facet_fields");
                if (facetFields == null) {
                	log.error("Unexpected Solr response - no facet_fields field "+facetQuery.stringify());
                    throw new RuntimeException("Unexpected Solr response - no facet_fields field");
                }
                JsonNode facetNodes = facetFields.get("crt_type_facet");
                if (facetNodes == null) {
                    log.error("Unexpected Solr response - no crt_type_facet field " + facetQuery.stringify());
                    throw new RuntimeException("Unexpected Solr response - no crt_type_facet field");
                }
                // User requested facets
                for(String facetName: includedFacets) {
                    JsonNode tempNode = facetFields.get(facetName);
                    if (tempNode == null) {
                        log.error("No " + facetName + " is available in as facet for the given query " + facetQuery.stringify());
                    } else if ( tempNode.isArray() && tempNode.size() > 1) {
                        getLog().debug("User requested facet " + facetName + "found as a valid facet");
                        dynamicFacets.add(facetName);
                    }
                }

                // Other facets
                Iterator<JsonNode> facetNodeIt = facetNodes.elements();
                while (facetNodeIt.hasNext()) {
//                    String facetName = String.format("%s_ft", facetNodeIt.next().asText());
                    String facetName = facetNodeIt.next().asText();
                    int facetCount = facetNodeIt.next().asInt();
                    if (!excludedFacets.contains(facetName)) {
                        getLog().debug("Dynamic facet '" + facetName + "' -> " + facetCount);
                        dynamicFacets.add(facetName);
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
            } catch (TimeoutException e) {
            	log.error("No Solr response acquired in " + timeout + "s.", e);
                throw new RuntimeException("No Solr response acquired in " + timeout + "s.", e);
            }
        } catch (InterruptedException e) {
        	log.error("Solr parsing thread was interrupted for query '" + facetQuery.stringify() + "'", e);
            throw new RuntimeException("Solr parsing thread was interrupted for query '" + facetQuery.stringify() + "'", e);
        } catch (ExecutionException e) {
        	log.error("Execution of Solr parsing thread failed for query '" + facetQuery.stringify() + "'", e);
            throw new RuntimeException(
                    "Execution of Solr parsing thread failed for query '" + facetQuery.stringify() + "'", e);
        } catch (IOException e) {
        	log.error("Unable to calculate most commonly used facets for query '" + facetQuery.stringify() + "'", e);
            throw new RuntimeException(
                    "Unable to calculate most commonly used facets for query '" + facetQuery.stringify() + "'", e);
        }
    }

    //TODO: should I suppose attrQuery has everything I need to get the correct attributes - No check here?
    private Set<String> executeAndParseCommonAttributeQuery(HttpSolrQuery attrQuery) {
        try(final PipedInputStream in = new PipedInputStream();
        		final PipedOutputStream out = new PipedOutputStream(in)) {

            ExecutorService singleExecutor = Executors.newSingleThreadExecutor();
            Future<Set<String>> ftResults = singleExecutor.submit(() -> {
                Set<String> commonAttributes = new HashSet<>();
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode jsonNode = objectMapper.readTree(in);
                JsonNode facetCounts = jsonNode.get("facet_counts");
                if (facetCounts == null) {
                    return commonAttributes;
                }
                JsonNode facetFields = facetCounts.get("facet_fields");
                if (facetFields == null) {
                    return commonAttributes;
                }
                Iterator<String> fieldNamesIt = facetFields.fieldNames();
                while (fieldNamesIt.hasNext()) {
                    String fieldName = fieldNamesIt.next();
                    JsonNode fieldValue = facetFields.get(fieldName);
                    if (fieldValue.elements().hasNext()) {
                        commonAttributes.add(fieldName);
                    }
                }
                return commonAttributes;
            });

            streamSolrResponse(out, attrQuery);

            long timeout = 600;
            try {
                Set<String> results = ftResults.get(timeout, TimeUnit.SECONDS);
                singleExecutor.shutdown();
                return results;
            } catch (TimeoutException e) {
            	log.error("No Solr response acquired in " + timeout + "s.", e);
                throw new RuntimeException("No Solr response acquired in " + timeout + "s.", e);
            }
        } catch (InterruptedException e) {
        	log.error("Solr parsing thread was interrupted", e);
            throw new RuntimeException("Solr parsing thread was interrupted", e);
        } catch (ExecutionException e) {
        	log.error("Execution of Solr parsing thread failed", e);
            throw new RuntimeException("Execution of Solr parsing thread failed", e);
        } catch (IOException e) {
        	log.error("Unable to calculate most commonly used facets", e);
            throw new RuntimeException("Unable to calculate most commonly used facets", e);
        }
    }

}
