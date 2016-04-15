package uk.ac.ebi.spot.biosamples.controller;

import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.response.FacetField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.solr.core.SolrOperations;
import org.springframework.data.solr.core.SolrTemplate;
import org.springframework.data.solr.core.query.*;
import org.springframework.data.solr.core.query.result.FacetEntry;
import org.springframework.data.solr.core.query.result.FacetFieldEntry;
import org.springframework.data.solr.core.query.result.FacetPage;
import org.springframework.data.solr.core.query.result.FacetQueryEntry;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import uk.ac.ebi.spot.biosamples.model.Merged;
import uk.ac.ebi.spot.biosamples.model.SearchRequest;
import uk.ac.ebi.spot.biosamples.repository.MergedRepository;

import javax.servlet.http.HttpServletResponse;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Created by lucacherubin on 01/03/2016.
 */
@Controller
@RequestMapping("/api")
public class SearchController {

	private Logger log = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private SolrOperations mergedSolrTemplate;

    @Autowired
    private MergedRepository mergedRepository;
	
    @NotNull
    @Value("${solr.searchapi.server}")
    private String baseSolrUrl;

    @Value("#{'${dynamic.facet.ignored.fields}'.split(',')}")
    private List<String> ignoredFacetFields;

    @CrossOrigin
    @RequestMapping(value = "/search")
    public void find(
//            SearchRequest searchRequest, //TODO Spring is not able to read correctly the filter fields
            @RequestParam("searchTerm") String searchTerm,
            @RequestParam(value = "useFuzzySearch", defaultValue = "false") boolean useFuzzySearch,
            @RequestParam(value = "start", defaultValue = "0") int start,
            @RequestParam(value = "row", defaultValue = "10") int row,
            @RequestParam(value = "filters[]", required = false, defaultValue = "") String[] filters,
            HttpServletResponse response) throws Exception {

        SolrQuery query = new SolrQuery();

//        String searchTerm = searchRequest.getSearchTerm();

//        if (searchRequest.useFuzzySearch()) {
//            searchTerm = searchRequest.getFuzzyfiedTerm();
//        }

        if (useFuzzySearch) {
            searchTerm = searchTerm.replaceAll("(\\w+)","$0~");
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
                        filterKey = String.format("%s_crt", filterKey);
                }
                query.addFilterQuery(String.format("%s:%s", filterKey, filterValue));
            }
        }

        // Setup result number
//        query.setRows(searchRequest.getRows()).setStart(searchRequest.getStart());
        query.setRows(row).setStart(start);

        // Setup highlighting
        query.setHighlight(true);
        query.setHighlightFragsize(0);
        query.addHighlightField("description");
        query.setHighlightSimplePre("<span class='highlight'>").setHighlightSimplePost("</span>");

        // Forward query to SolR
        String finalQuery = baseSolrUrl + query.toString();
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
        facetLimit = ignoredFacetFields.size() - 1 + facetLimit;

        FacetQuery facetQuery = new SimpleFacetQuery(new SimpleStringCriteria(searchTerm));
        FacetOptions facetOptions = new FacetOptions();
        facetOptions.addFacetOnField("crt_type_ft");
        facetOptions.setFacetLimit(facetLimit);
        facetQuery.setFacetOptions(facetOptions);
        FacetPage<Merged> facetResults = mergedSolrTemplate.queryForFacetPage(facetQuery,Merged.class);

        for (FacetFieldEntry e : facetResults.getFacetResultPage("crt_type_ft")) {
            String facetName = e.getValue();
            if ( ! ignoredFacetFields.contains(facetName) ) {
                dynamicFacets.add(String.format("%s_ft", facetName));
            }
        }

        return dynamicFacets;

    }



}
