package uk.ac.ebi.spot.biosamples.controller;

import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.solr.client.solrj.SolrQuery;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import uk.ac.ebi.spot.biosamples.model.SearchRequest;

import javax.servlet.http.HttpServletResponse;

/**
 * Created by lucacherubin on 01/03/2016.
 */
@Controller
public class SearchApiController {

    private final String baseSolrUrl = "http://beans.ebi.ac.uk:8983/solr/prototype/select?";


    @RequestMapping(value = "search/query")
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
        query.addFacetField("organism_crt");
        query.addFacetField("organ_crt");

        // Add filter querys
        if (!searchRequest.getTypeFilter().isEmpty()) {
            query.addFilterQuery(String.format("content_type:%s", searchRequest.getTypeFilter()));
        }

        if (!searchRequest.getOrganismFilter().isEmpty()) {
            query.addFilterQuery(String.format("organism_crt:%s", searchRequest.getOrganismFilter()));
        }

        if (!searchRequest.getOrganFilter().isEmpty()) {
            query.addFilterQuery(String.format("organ_crt:%s", searchRequest.getOrganFilter()));
        }

        query.setRows(searchRequest.getRows()).setStart(searchRequest.getStart());


        query.setHighlight(true);
        query.setHighlightFragsize(0);
        query.addHighlightField("description");
        query.setHighlightSimplePre("<span class='highlight'>").setHighlightSimplePost("</span>");


        String finalQuery = baseSolrUrl + query.toString();

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

}
