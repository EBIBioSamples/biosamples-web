package uk.ac.ebi.spot.biosamples.controller;

import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.solr.client.solrj.SolrQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.solr.core.SolrOperations;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.FacetOptions;
import org.springframework.data.solr.core.query.FacetQuery;
import org.springframework.data.solr.core.query.SimpleFacetQuery;
import org.springframework.data.solr.core.query.SimpleStringCriteria;
import org.springframework.data.solr.core.query.result.FacetFieldEntry;
import org.springframework.data.solr.core.query.result.FacetPage;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import uk.ac.ebi.spot.biosamples.model.Merged;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashSet;
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

    @Autowired
    private SolrOperations mergedCoreSolrTemplate;

//    @NotNull
//    @Value("${solr.searchapi.server}")
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
            while ( line != null ) {
                Matcher matcher = pattern.matcher(line);
                if (matcher.find()) {
                    ignoredFacets.add(matcher.group(1).trim());
                }
                line = br.readLine();
            }
            br.close();
        } catch (IOException e) {
            e.printStackTrace();
            ignoredFacets.add("content_type");
        }
    }

    @CrossOrigin
    @RequestMapping(value = "/search")
    public void find(
//            SearchRequest searchRequest, //TODO Spring is not able to read correctly the filter fields
            @RequestParam("searchTerm") String searchTerm,
            @RequestParam(value = "useFuzzySearch", defaultValue = "false") boolean useFuzzySearch,
            @RequestParam(value = "start", defaultValue = "0") int start,
            @RequestParam(value = "rows", defaultValue = "10") int rows,
            @RequestParam(value = "filters[]", required = false, defaultValue = "") String[] filters,
            HttpServletResponse response) throws Exception {

        SolrQuery query = new SolrQuery();
        boolean isGenericQuery = searchTerm.matches("\\**");
//        String searchTerm = searchRequest.getSearchTerm();

//        if (searchRequest.useFuzzySearch()) {
//            searchTerm = searchRequest.getFuzzyfiedTerm();
//        }
        if (isGenericQuery) {
            searchTerm = "*:*";
        } else {
            if (useFuzzySearch) {
                searchTerm = searchTerm.replaceAll("(\\w+)","$0~");
            }
        }

        query.set("q", searchTerm);
        query.set("wt", "json");

        // Setup facets
        query.setFacet(true);
        query.addFacetField("content_type");
        List<String> dynamicFacets = getMostUsedFacets(searchTerm,5);
        dynamicFacets.forEach(query::addFacetField);
        query.setFacetLimit(5);

        // Setup filters
        for(String filter: filters) {
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
                query.addFilterQuery(String.format("%s:\"%s\"", filterKey, filterValue));
            }
        }

        // Setup result number
//        query.setRows(searchRequest.getRows()).setStart(searchRequest.getStart());
        query.setRows(rows).setStart(start);

        // Setup highlighting
        // Highlight is working only if searching for specific terms
        if (!isGenericQuery) {
            query.setHighlight(true);
            query.setHighlightFragsize(0);
            query.addHighlightField("description");
            query.setHighlightSimplePre("<span class='highlight'>").setHighlightSimplePost("</span>");
        }

        // Forward query to SolR
        String finalQuery = solrServerUrl + "merged/select?" + query.toString();
        log.trace("finalQuery = "+finalQuery);
        this.forwardSolrResponse(response, finalQuery);

    }

    private void forwardSolrResponse(HttpServletResponse response, String query) throws Exception {

        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet getRequest =  new HttpGet(query);


        try (CloseableHttpResponse httpResponse = httpClient.execute(getRequest)) {
            HttpEntity entity = httpResponse.getEntity();
            entity.writeTo(response.getOutputStream());
            EntityUtils.consume(entity);
        } catch (Exception e) {
            response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
            response.getOutputStream().println("Internal Server Error");


        }
    }

    private List<String> getMostUsedFacets(String searchTerm, int facetLimit) {

        List<String> dynamicFacets = new ArrayList<>();
        facetLimit = ignoredFacets.size() - 1 + facetLimit;

        FacetQuery facetQuery = new SimpleFacetQuery(new SimpleStringCriteria(searchTerm));
        FacetOptions facetOptions = new FacetOptions();
        facetOptions.addFacetOnField("crt_type_ft");
        facetOptions.setFacetLimit(facetLimit);
        facetQuery.setFacetOptions(facetOptions);
        FacetPage<Merged> facetResults = mergedCoreSolrTemplate.queryForFacetPage(facetQuery,Merged.class);

        for (FacetFieldEntry e : facetResults.getFacetResultPage("crt_type_ft")) {
            String facetName = e.getValue();
            if ( ! ignoredFacets.contains(facetName) ) {
                dynamicFacets.add(String.format("%s_ft", facetName));
            }
        }

        return dynamicFacets;

    }



}
