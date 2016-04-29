package uk.ac.ebi.spot.biosamples.controller;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by lucacherubin on 01/03/2016.
 */
@Controller
@RequestMapping("/api")
public class SearchController {
    private Logger log = LoggerFactory.getLogger(this.getClass());

    @Value("${solr.server}")
    private String solrServerUrl;

    @Value("classpath:ignoredFacets.fields")
    private Resource ignoredFacetsResource;

    private Set<String> ignoredFacets;

    @PostConstruct
    private void readIgnoredFacet() {

        ignoredFacets = new HashSet<>();
        ignoredFacets.add("content_type"); // content_type is always returned as facet

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

    @CrossOrigin
    @RequestMapping(value = "/search")
    public void find(
            @RequestParam("searchTerm") String searchTerm,
            @RequestParam(value = "useFuzzySearch", defaultValue = "false") boolean useFuzzySearch,
            @RequestParam(value = "start", defaultValue = "0") int start,
            @RequestParam(value = "rows", defaultValue = "10") int rows,
            @RequestParam(value = "filters[]", required = false, defaultValue = "") String[] filters,
            HttpServletResponse response) throws Exception {

        StringBuilder queryBuilder = new StringBuilder();
        boolean isGenericQuery = searchTerm.matches("\\**");
        if (isGenericQuery) {
            searchTerm = "*:*";
        }
        else {
            if (useFuzzySearch) {
                searchTerm = searchTerm.replaceAll("(\\w+)", "$0~");
            }
        }

        queryBuilder.append("q=").append(searchTerm);
        queryBuilder.append("&wt=json");

        // Setup facets
        queryBuilder.append("&facet=true");
        queryBuilder.append("&facet.field=content_type");

        // Setup filters
        for (String filter : filters) {
            String[] baseFilter = filter.split("(Filter\\|)");
            if (baseFilter.length == 2) {
                String filterKey = baseFilter[0];
                String filterValue = baseFilter[1];

                switch (filterKey) {
                    case "content_type":
                        break;
                    default:
                        filterKey = String.format("%s_crt_ft", filterKey);
                }
                queryBuilder.append("&fq=").append(String.format("%s:\"%s\"", filterKey, filterValue));
            }
        }

        // Setup result number
        queryBuilder.append("&rows=").append(rows);
        queryBuilder.append("&start=").append(start);

        // Setup highlighting
        // Highlight is working only if searching for specific terms
        if (!isGenericQuery) {
            queryBuilder.append("&hl=true");
            queryBuilder.append("&hl.fragsize=0");
            queryBuilder.append("&hl.fl=description");
            queryBuilder.append("&hl.simple.pre=").append(URLEncoder.encode("<spanclass='highlight'>", "UTF-8"));
            queryBuilder.append("&hl.simple.post=").append(URLEncoder.encode("</span>", "UTF-8"));
        }

        // execute this query once to get most used facets...
        List<String> dynamicFacets = getMostUsedFacets(queryBuilder.toString(), 5);
        dynamicFacets.forEach(facet -> queryBuilder.append("&facet.field=").append(facet));
        queryBuilder.append("&facet.limit=" + 10);

        // Forward query to SolR
        this.streamSolrResponse(response.getOutputStream(), queryBuilder.toString());
    }

    private List<String> getMostUsedFacets(String query, int facetLimit) throws IOException {
        List<String> dynamicFacets = new ArrayList<>();
        facetLimit = ignoredFacets.size() - 1 + facetLimit;

        StringBuilder facetQuery = new StringBuilder(query);
        facetQuery.append("&facet.field=crt_type_ft");
        facetQuery.append("&facet.limit=").append(facetLimit);

        final PipedInputStream in = new PipedInputStream();
        final PipedOutputStream out = new PipedOutputStream(in);

        new Thread(() -> {
            try {
                streamSolrResponse(out, facetQuery.toString());
            }
            catch (IOException e) {
                try {
                    out.close();
                }
                catch (IOException e1) {
                    // tried our best
                }
            }
        }).start();

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(in);
        JsonNode facetNodes = jsonNode.get("facet_counts").get("facet_queries").get("facet_fields").get("crt_type_ft");
        Iterator<JsonNode> facetNodeIt = facetNodes.elements();
        while (facetNodeIt.hasNext()) {
            String facetName = facetNodeIt.next().asText();
            int facetCount = facetNodeIt.next().asInt();
            log.debug("Dynamic facet '" + facetName + "' -> " + facetCount);
            dynamicFacets.add(String.format("%s_ft", facetName));
        }

        return dynamicFacets;
    }

    private void streamSolrResponse(OutputStream outputStream, String query) throws IOException {
        String requestUrl = solrServerUrl + "merged/select?" + query;
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet getRequest = new HttpGet(requestUrl);
        try (CloseableHttpResponse httpResponse = httpClient.execute(getRequest)) {
            HttpEntity entity = httpResponse.getEntity();
            entity.writeTo(outputStream);
            EntityUtils.consume(entity);
        }
    }
}
