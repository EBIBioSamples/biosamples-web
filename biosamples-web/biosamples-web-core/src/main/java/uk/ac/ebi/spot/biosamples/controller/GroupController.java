package uk.ac.ebi.spot.biosamples.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import uk.ac.ebi.spot.biosamples.controller.utils.LegacyApiQueryParser;
import uk.ac.ebi.spot.biosamples.exception.APIXMLNotFoundException;
import uk.ac.ebi.spot.biosamples.exception.HtmlContentNotFound;
import uk.ac.ebi.spot.biosamples.exception.RequestParameterSyntaxException;
import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;
import uk.ac.ebi.spot.biosamples.model.solr.SolrIgnoredField;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.model.xml.GroupResultQuery;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQuery;
import uk.ac.ebi.spot.biosamples.repository.solr.SolrGroupRepository;
import uk.ac.ebi.spot.biosamples.repository.solr.SolrSampleRepository;
import uk.ac.ebi.spot.biosamples.service.HttpSolrDispatcher;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class GroupController {
	@Autowired
	private SolrGroupRepository solrGroupRepository;

	@Autowired
	private SolrSampleRepository solrSampleRepository;

	@Autowired
	private HttpSolrDispatcher httpSolrDispatcher;

	@Value("${relations.server:http://www.ebi.ac.uk/biosamples/relations}")
	private String relationsServerUrl;

	private final Logger log = LoggerFactory.getLogger(getClass());

	protected Logger getLog() {
		return log;
	}

	@RequestMapping(value = "groups/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
	public String group(Model model, @PathVariable String accession) {
		
		SolrGroup group = solrGroupRepository.findOne(accession);

		if (group != null) {
			
			model.addAttribute("group", group);
			if (group.getSamples() == null) {
				model.addAttribute("groupSize", 0);
			} else {
				model.addAttribute("groupSize", group.getSamples().size());
			}	
			model.addAttribute("relationsUrl", relationsServerUrl);
			if (group.hasSamples()) {
				// Sample common attributes
				//first get the types of all attributes where the number of hits is equal to the number of samples
				Set<String> tempSampleCommonCharacteristics = httpSolrDispatcher.getGroupCommonAttributes(accession,
						group.getSamples().size());
				//now that we have the attribute types, we need to go get the attribute values
				TreeMap<String, List<String>> sampleCommonAttributes = new TreeMap<>();
				SolrSample sample = solrSampleRepository.findFirstByGroupsContains(accession);
				if (sample != null) {
					Map<String, List<String>> sampleCrts = sample.getCharacteristics();
					for (String attribute : tempSampleCommonCharacteristics) {
						if (!SolrIgnoredField.SAMPLE.isIgnored(attribute.replaceFirst("_ft$", ""))) {
							List<String> crtValues = sampleCrts.get(attribute.replaceFirst("_crt_ft$", ""));
							sampleCommonAttributes.put(cleanAttributeName(attribute), crtValues);
						}
					}
				}
				model.addAttribute("common_attrs", sampleCommonAttributes);
				
				// Samples table attributes
				Set<String> allGroupSamplesCharacteristics = httpSolrDispatcher.getGroupSamplesAttributes(accession);
			
				//list of attribute types to use as table columns
				//make sure to exclude common attribtues displayed above
				//and relationships that aren't on the API result
				List<String> tableAttributes = Stream.concat(Arrays.stream(new String[] { "accession", "sampleName"}), 
						allGroupSamplesCharacteristics.stream().map(this::cleanAttributeName) )
					.filter(attr -> !sampleCommonAttributes.containsKey(attr))
					.filter(attr -> !SolrIgnoredField.SAMPLE.isIgnored(attr+"_crt"))
					.distinct().collect(Collectors.toList());

				model.addAttribute("table_attrs", tableAttributes);
			}
			return "group";
		} else {
			throw new HtmlContentNotFound("No group has been found with accession " + accession);
		}
	}

	@RequestMapping(value = "groups/{accession}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.GET)
	public @ResponseBody SolrGroup groupJson(@PathVariable String accession) {
		return solrGroupRepository.findOne(accession);
	}

	@RequestMapping(value = "groups/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String groupXml(@PathVariable String accession) throws APIXMLNotFoundException {
		SolrGroup group = solrGroupRepository.findOne(accession);

		if (group.getXml() == null || group.getXml().isEmpty()) {
			throw new APIXMLNotFoundException("No XML present for " + group.getAccession());
		} else {
			return group.getXml();
		}
	}

	@RequestMapping(value = "xml/groups", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String groupXmlQuery(@RequestParam(value = "query") String searchTerm,
			@RequestParam(value = "sortby", defaultValue = "score") String sortBy,
			@RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
			@RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
			@RequestParam(value = "page", defaultValue = "0") int page) {
		Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
		PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
		Page<SolrGroup> results = solrGroupRepository.findByKeywords(searchTerm, querySpec);
		ResultQuery rq = new GroupResultQuery(results);
		return rq.renderDocument();
	}

	@RequestMapping(value = "xml/groups/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String hybridGroupXml(@PathVariable String accession) throws APIXMLNotFoundException {
		return groupXml(accession);
	}

    @ExceptionHandler(APIXMLNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleAXNFE(APIXMLNotFoundException e) {
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
		getLog().error("Failed to parse legacy query request", e);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.TEXT_PLAIN);
		return new ResponseEntity<>("Could not interpret query request: " + e.getMessage(), headers,
				HttpStatus.BAD_REQUEST);
	}

	private String cleanAttributeName(String name) {
		name = name.substring(0, name.indexOf("_crt_ft"));
		return name;
		/*
		 * return Arrays.stream(name.split("_")).map(part -> { return
		 * part.substring(0, 1).toUpperCase() + part.substring(1,
		 * part.length()).toLowerCase(); }).collect(Collectors.joining(" "));
		 */
	}
}
