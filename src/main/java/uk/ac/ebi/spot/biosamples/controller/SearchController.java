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

    @CrossOrigin
    @RequestMapping(value = "/search")
    public void find(
            SearchRequest searchRequest,
            HttpServletResponse response) throws Exception {


        String searchTerm = searchRequest.getSearchTerm();

        SolrQuery query = new SolrQuery();


        if (searchRequest.useFuzzySearch()) {
            searchTerm = searchRequest.getFuzzyfiedTerm();
        }


        query.set("q", searchTerm);
        query.set("wt", "json");

        // Setup facets
        query.setFacet(true);




        query.addFacetField("content_type");


        List<String> dynamicFacets = getMostUsedFacets(searchTerm,5);
        for(String facet: dynamicFacets) {
            query.addFacetField(facet);
        }

        query.setFacetLimit(5);


        // Add filter querys
//        if (!searchRequest.getTypeFilter().isEmpty()) {
//            query.addFilterQuery(String.format("content_type:%s", searchRequest.getTypeFilter()));
//        }
//        if (!searchRequest.getOrganismFilter().isEmpty()) {
//            query.addFilterQuery(String.format("organism_crt:%s", searchRequest.getOrganismFilter()));
//        }
//
//        if (!searchRequest.getOrganFilter().isEmpty()) {
//            query.addFilterQuery(String.format("organ_crt:%s", searchRequest.getOrganFilter()));
//        }

        query.setRows(searchRequest.getRows()).setStart(searchRequest.getStart());


        query.setHighlight(true);
        query.setHighlightFragsize(0);
        query.addHighlightField("description");
        query.setHighlightSimplePre("<span class='highlight'>").setHighlightSimplePost("</span>");


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


        FacetQuery facetQuery = new SimpleFacetQuery(new SimpleStringCriteria(searchTerm));
        FacetOptions facetOptions = new FacetOptions();
        facetOptions.addFacetOnField("crt_type_ft");
        facetOptions.setFacetLimit(facetLimit);
        facetQuery.setFacetOptions(facetOptions);
        FacetPage<Merged> facetResults = mergedSolrTemplate.queryForFacetPage(facetQuery,Merged.class);

        Iterator<FacetFieldEntry> i = facetResults.getFacetResultPage("crt_type_ft").iterator();
        while(i.hasNext()) {
            FacetFieldEntry e = i.next();
            dynamicFacets.add(e.getValue());
        }

        return dynamicFacets;

    }



}
