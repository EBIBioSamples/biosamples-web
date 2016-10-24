package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import uk.ac.ebi.spot.biosamples.service.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by lucacherubin on 01/03/2016.
 */
@Controller
public class SearchController {
    @Autowired
    private HttpSolrDispatcher httpSolrDispatcher;

    @Autowired
    private SolrQueryBuilder solrQueryBuilder;

    @Autowired
    private AutoSuggestQueryBuilder autoSuggestQueryBuilder;

    @CrossOrigin(methods = RequestMethod.GET)
    @RequestMapping(value = "/api/search")
    public void find(
            @RequestParam("searchTerm") String searchTerm,
            @RequestParam(value = "useFuzzySearch", defaultValue = "false") boolean useFuzzySearch,
            @RequestParam(value = "start", defaultValue = "0") int start,
            @RequestParam(value = "rows", defaultValue = "10") int rows,
            @RequestParam(value = "filters[]", required = false, defaultValue = "") String[] filters,
            HttpServletResponse response) throws Exception {

        // first, evaluate arguments to work out how to create the query
        boolean isGenericQuery = searchTerm.matches("\\**");
        if (!isGenericQuery) {
            if (useFuzzySearch) {
                searchTerm = searchTerm.replaceAll("(\\w+)", "$0~");
            }
        }
        Map<String, String> solrFilters = parseFilters(filters);

        // now create the query
        HttpSolrQuery solrQuery = isGenericQuery
                ? solrQueryBuilder.createQuery("*", "*")
                : solrQueryBuilder.createQuery(searchTerm);

        for (String filterKey : solrFilters.keySet()) {
            solrQuery.withFilterOn(filterKey, solrFilters.get(filterKey));
        }

        // and configure our query
        solrQuery
                .withContentType(HttpSolrQuery.CONTENT_TYPE.JSON)
                .withFacetOn("content_type")
                .withFacetOn(httpSolrDispatcher.getMostUsedFacets(solrQuery, 5))
                .withFacetLimit(5)
                .withPage(start, rows);

        // Setup highlighting
        // Highlight is working only if searching for specific terms
        if (!isGenericQuery) {
            solrQuery.withHighlighting("description");
        }

        // Forward query to Solr
        httpSolrDispatcher.streamSolrResponse(response.getOutputStream(), solrQuery);
    }


    @CrossOrigin(methods = RequestMethod.GET)
    @RequestMapping(value = "/api/suggest")
    public void autoSuggest(@RequestParam("term") String searchTerm, HttpServletResponse response) throws IOException {
        AutoSuggestSolrQuery suggestions = autoSuggestQueryBuilder.createQuery(searchTerm);
        httpSolrDispatcher.streamSolrResponse(response.getOutputStream(), suggestions);
    }

    private Map<String, String> parseFilters(String... filters) {
        // Setup filters
        Map<String, String> results = new HashMap<>();
        for (String filter : filters) {
            String[] baseFilter = filter.split("(Filter\\|)");
            if (baseFilter.length == 2) {
                String filterKey = baseFilter[0];
                String filterValue = baseFilter[1];

                if (!filterKey.equals("content_type")) {
                    filterKey = String.format("%s_crt_ft", filterKey);
                }

                results.put(String.format("%s", filterKey), String.format("%s", filterValue));
            }
        }
        return results;
    }
}
