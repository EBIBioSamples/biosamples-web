package uk.ac.ebi.spot.biosamples.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.hal.Jackson2HalModule;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import uk.ac.ebi.spot.biosamples.controller.utils.LegacyApiQueryParser;
import uk.ac.ebi.spot.biosamples.exception.APIXMLNotFoundException;
import uk.ac.ebi.spot.biosamples.exception.HtmlContentNotFound;
import uk.ac.ebi.spot.biosamples.exception.RequestParameterSyntaxException;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQuery;
import uk.ac.ebi.spot.biosamples.model.xml.SampleResultQuery;
import uk.ac.ebi.spot.biosamples.repository.solr.SolrSampleRepository;
import uk.ac.ebi.spot.biosamples.service.RelationsLinkFactory;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 12/02/16
 */
@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class SampleController {
    @Autowired private SolrSampleRepository sampleRepository;

    @Autowired private RelationsLinkFactory relationsLinkFactory;

    @Value("${relations.server:http://www.ebi.ac.uk/biosamples/relations}")
    private String relationsServerUrl;

    private RestTemplate restTemplate;

    private final Logger log = LoggerFactory.getLogger(getClass());

    @PostConstruct
    private void createObjectMapper() {

        restTemplate = new RestTemplate();            
		//need to create a new message converter to handle hal+json
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		mapper.registerModule(new Jackson2HalModule());
		MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
		converter.setSupportedMediaTypes(MediaType.parseMediaTypes("application/hal+json"));
		converter.setObjectMapper(mapper);

		//add the new converters to the restTemplate
		//but make sure it is BEFORE the existing converters
		List<HttpMessageConverter<?>> converters = restTemplate.getMessageConverters();
		converters.add(0,converter);
		restTemplate.setMessageConverters(converters);
    }

    @RequestMapping(value = "samples/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
    public String sample(Model model, @PathVariable String accession, HttpServletRequest request) {
        SolrSample sample = sampleRepository.findOne(accession);

        if (sample != null) {
            model.addAttribute("sample", sample);
            model.addAttribute("relationsUrl", relationsServerUrl);

            String relationsURL = relationsLinkFactory.createRelationsLinkForSample(sample).getHref();
            log.info("Getting relations from "+relationsURL);
    		
            
            
            
            try {            	
				ResponseEntity<Resource<SampleRelationsWrapper>> response = restTemplate.exchange(relationsURL, 
						HttpMethod.GET, null, new ParameterizedTypeReference<Resource<SampleRelationsWrapper>>(){});
				
				log.info("reponse = "+response);
				log.info("reponse.getBody() = "+response.getBody());
				
				for (Link link : response.getBody().getLinks()) {
					log.info("Found link "+link);
				}				
				
				for (String target : getLinksByType(response.getBody(), "derivedTo")) {
					log.info(target);
				}				
				
				SampleRelationsWrapper result = response.getBody().getContent();
				log.info("SampleRelationshipWrapper = "+result+" "+result.getAccession());
				
				/*
                model.addAttribute("derivedFrom", result.getDerivedFrom());
                model.addAttribute("derivedTo", result.getDerivedTo());
                model.addAttribute("childOf", result.getChildOf());
                model.addAttribute("parentOf", result.getParentOf());
                model.addAttribute("sameAs", result.getSameAs());
                model.addAttribute("curatedInto", result.getRecuratedInto());
                model.addAttribute("curatedFrom", result.getRecuratedFrom());
                */
            } catch (RestClientException e) {
                log.error("Failed to retrieve relations data from '" + relationsURL + "'", e);
            }
            log.info("Model is "+model);
            return "sample";
        } else {
            throw new HtmlContentNotFound("No sample found with accession " + accession);
        }
    }
    
    private List<String> getLinksByType(Resource<?> resource, String type) {
    	List<String> out = new ArrayList<>();
    	resource.getLinks().stream()
    			.filter((link) -> type.equals(link.getRel()))
    			.forEach((link) -> out.add(link.getHref()));
    	//now that there are hrefs for the linktype page, each separate link needs to be got
		return out;
    }

    @RequestMapping(value = "samples/{accession}",
                    produces = MediaType.APPLICATION_JSON_UTF8_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody SolrSample sampleJson(@PathVariable String accession) {
        return sampleRepository.findOne(accession);
    }

    @RequestMapping(value = "samples/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleXml(@PathVariable String accession) {
        SolrSample sample = sampleRepository.findOne(accession);
        if (sample == null) {
            throw new NullPointerException("Accession '" + accession + "' not found");
        }
        if (sample.getXml() == null || sample.getXml().isEmpty()) {
            throw new APIXMLNotFoundException("No XML available for accession '" + accession + "'");
        }
        return sample.getXml();
    }

    @RequestMapping(value = "xml/samples", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleXmlQuery(
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
            @RequestParam(value = "page", defaultValue = "0") int page) {
        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
        PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
        Page<SolrSample> results = sampleRepository.findByAccession(searchTerm, querySpec);
        ResultQuery rq = new SampleResultQuery(results);
        return rq.renderDocument();
    }

    @RequestMapping(value = "xml/samples/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String hybridSampleXml(@PathVariable String accession) {
        return sampleXml(accession);
    }

    @RequestMapping(value = "xml/sample/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String legacySampleXml(@PathVariable String accession) {
        return sampleXml(accession);
    }

    @RequestMapping(value = "xml/sample/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String legacySampleXmlQueryRedirect(@PathVariable String query) {
        Map<String, String> paramMap = LegacyApiQueryParser.parseLegacyQueryFormat(query);
        return sampleXmlQuery(
                paramMap.get("query"),
                paramMap.get("sortby"),
                paramMap.get("sortorder"),
                Integer.parseInt(paramMap.get("pagesize")),
                Integer.parseInt(paramMap.get("page")));
    }

    @RequestMapping(value = "xml/groupsamples/{accession}/query={query}",
                    produces = MediaType.TEXT_XML_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody String legacySampleInGroupXmlQueryRedirect(@PathVariable String accession,
                                                                    @PathVariable String query) {
        Map<String, String> paramMap = LegacyApiQueryParser.parseLegacyQueryFormat(query);
        return sampleInGroupXmlQuery(
                accession,
                paramMap.get("query"),
                paramMap.get("sortby"),
                paramMap.get("sortorder"),
                Integer.parseInt(paramMap.get("pagesize")),
                Integer.parseInt(paramMap.get("page")));
    }

    @RequestMapping(value = "xml/groupsamples/{accession}",
                    produces = MediaType.TEXT_XML_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody String sampleInGroupXmlQuery(
            @PathVariable(value = "accession") String groupAccession,
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
            @RequestParam(value = "page", defaultValue = "0") int page) {
        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
        PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
        Page<SolrSample> results = sampleRepository.findByKeywordsAndGroupsContains(searchTerm, groupAccession, querySpec);
        ResultQuery rq = new SampleResultQuery(results);
        return rq.renderDocument();
    }

    @RequestMapping(value = "groupsamples/{accession}",
                    produces = MediaType.APPLICATION_JSON_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody
    Page<SolrSample> samplesInGroup(
            @PathVariable(value = "accession") String groupAccession,
            @RequestParam(value = "query", defaultValue = "*:*") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
            @RequestParam(value = "page", defaultValue = "0") int page) {

        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
        PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
        return sampleRepository.findByKeywordsAndGroupsContains(searchTerm, groupAccession, querySpec);
    }



    @ExceptionHandler(NullPointerException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleNPE(NullPointerException e) {
        log.error("There is no data available for this accession - return NOT_FOUND response", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("There is no data available for this accession: " + e.getMessage(),
                                    headers,
                                    HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(APIXMLNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleAXNFE(NullPointerException e) {
        log.error("There is no XML available for this accession - return NOT_FOUND response", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("There is no XML available for this accession: " + e.getMessage(),
                                    headers,
                                    HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RequestParameterSyntaxException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleRPSE(RequestParameterSyntaxException e) {
        log.error("Failed to parse legacy query request", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("Could not interpret query request: " + e.getMessage(),
                                    headers,
                                    HttpStatus.BAD_REQUEST);
    }
}
