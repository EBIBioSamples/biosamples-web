package uk.ac.ebi.spot.biosamples.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.biosamples.controller.utils.LegacyApiQueryParser;
import uk.ac.ebi.spot.biosamples.exception.APIXMLNotFoundException;
import uk.ac.ebi.spot.biosamples.exception.HtmlContentNotFound;
import uk.ac.ebi.spot.biosamples.exception.RequestParameterSyntaxException;
import uk.ac.ebi.spot.biosamples.model.neo4j.NeoSample;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQuery;
import uk.ac.ebi.spot.biosamples.model.xml.SampleResultQuery;
import uk.ac.ebi.spot.biosamples.repository.neo4j.NeoSampleRepository;
import uk.ac.ebi.spot.biosamples.repository.solr.SolrSampleRepository;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class SampleController {
	@Autowired
	private SolrSampleRepository solrSampleRepository;
	
	@Autowired
	private NeoSampleRepository neoSampleRepository;

	private final Logger log = LoggerFactory.getLogger(getClass());

	@RequestMapping(value = "samples/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
	public String sample(Model model, @PathVariable String accession, HttpServletRequest request) {
		SolrSample solrSample = solrSampleRepository.findOne(accession);

		if (solrSample != null) {
			model.addAttribute("sample", solrSample);
		} else {
			throw new HtmlContentNotFound("No sample found with accession " + accession);
		}
		
		NeoSample neoSample = neoSampleRepository.findOneByAccession(accession);
		log.trace("neoSample = "+neoSample);
		model.addAttribute("hasRelations", false);	
		
		if (neoSample != null) {
			model.addAttribute("relations", neoSample);
			
			if (neoSample.getDerivedFrom() != null && neoSample.getDerivedFrom().size() > 0) {
				model.addAttribute("derivedFrom", neoSample.getDerivedFrom()
						.stream()
						.map((s)->s.getAccession())
						.collect(Collectors.toList()));
				model.addAttribute("hasRelations", true);
			}
			if (neoSample.getDerivedTo() != null && neoSample.getDerivedFrom().size() > 0) {
				model.addAttribute("derivedTo", neoSample.getDerivedTo()
						.stream()
						.map((s)->s.getAccession())
						.collect(Collectors.toList()));
				model.addAttribute("hasRelations", true);
			}
			
			if (neoSample.getChildOf() != null && neoSample.getChildOf().size() > 0) {
				model.addAttribute("childOf", neoSample.getChildOf()
						.stream()
						.map((s)->s.getAccession())
						.collect(Collectors.toList()));
				model.addAttribute("hasRelations", true);
			}
			if (neoSample.getParentOf() != null && neoSample.getParentOf().size() > 0) {
				model.addAttribute("parentOf", neoSample.getParentOf()
						.stream()
						.map((s)->s.getAccession())
						.collect(Collectors.toList()));
				model.addAttribute("hasRelations", true);
			}

			if (neoSample.getSameAs() != null && neoSample.getSameAs().size() > 0) {
				model.addAttribute("sameAs", neoSample.getSameAs()
						.stream()
						.map((s)->s.getAccession())
						.collect(Collectors.toList()));
				model.addAttribute("hasRelations", true);
			}

			if (neoSample.getRecuratedTo() != null && neoSample.getRecuratedTo().size() > 0) {
				model.addAttribute("recuratedInto", neoSample.getRecuratedTo()
						.stream()
						.map((s)->s.getAccession())
						.collect(Collectors.toList()));
				model.addAttribute("hasRelations", true);
			}
			if (neoSample.getRecuratedFrom() != null && neoSample.getRecuratedFrom().size() > 0) {
				model.addAttribute("recuratedFrom", neoSample.getRecuratedFrom()
						.stream()
						.map((s)->s.getAccession())
						.collect(Collectors.toList()));
				model.addAttribute("hasRelations", true);
			}
			
			if (neoSample.getGroups() != null && neoSample.getDerivedFrom().size() > 0) {
				model.addAttribute("hasRelations", true);
			}
		}

		
		log.trace("Model is " + model);
		return "sample";
	}

	@RequestMapping(value = "samples/{accession}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE, method = RequestMethod.GET)
	public @ResponseBody SolrSample sampleJson(@PathVariable String accession) {
		return solrSampleRepository.findOne(accession);
	}

	@RequestMapping(value = "samples/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String sampleXml(@PathVariable String accession) throws APIXMLNotFoundException {
		SolrSample sample = solrSampleRepository.findOne(accession);
		if (sample == null) {
			throw new APIXMLNotFoundException("Accession '" + accession + "' not found");
		}
		if (sample.getXml() == null || sample.getXml().isEmpty()) {
			throw new APIXMLNotFoundException("No XML available for accession '" + accession + "'");
		}
		return sample.getXml();
	}

	@RequestMapping(value = "xml/samples", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String sampleXmlQuery(@RequestParam(value = "query") String searchTerm,
			@RequestParam(value = "sortby", defaultValue = "score") String sortBy,
			@RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
			@RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
			@RequestParam(value = "page", defaultValue = "0") int page) {
		Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
		PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
		
		//if the search term is blank, default to matching everything
		if (searchTerm == null || searchTerm.trim().length() == 0) {
			searchTerm = "*";
		}
		
		Page<SolrSample> results = solrSampleRepository.findByText(searchTerm, querySpec);
		ResultQuery<SolrSample> rq = new SampleResultQuery(results);
		return rq.renderDocument();
	}

	@RequestMapping(value = "xml/samples/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String hybridSampleXml(@PathVariable String accession) throws APIXMLNotFoundException {
		return sampleXml(accession);
	}

//	@RequestMapping(value = "xml/sample/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
//	public @ResponseBody String legacySampleXml(@PathVariable String accession) throws APIXMLNotFoundException {
//		return sampleXml(accession);
//	}

	@RequestMapping(value = "xml/samples/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String legacySampleXmlQueryRedirect(@PathVariable String query) {
		Map<String, String> paramMap = LegacyApiQueryParser.parseLegacyQueryFormat(query);
		return sampleXmlQuery(paramMap.get("query"), paramMap.get("sortby"), paramMap.get("sortorder"),
				Integer.parseInt(paramMap.get("pagesize")), Integer.parseInt(paramMap.get("page")));
	}

	@RequestMapping(value = "xml/groupsamples/{accession}/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String legacySampleInGroupXmlQueryRedirect(@PathVariable String accession,
			@PathVariable String query) {
		Map<String, String> paramMap = LegacyApiQueryParser.parseLegacyQueryFormat(query);
		return sampleInGroupXmlQuery(accession, paramMap.get("query"), paramMap.get("sortby"),
				paramMap.get("sortorder"), Integer.parseInt(paramMap.get("pagesize")),
				Integer.parseInt(paramMap.get("page")));
	}

	@RequestMapping(value = "xml/groupsamples/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
	public @ResponseBody String sampleInGroupXmlQuery(@PathVariable(value = "accession") String groupAccession,
			@RequestParam(value = "query") String searchTerm,
			@RequestParam(value = "sortby", defaultValue = "score") String sortBy,
			@RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
			@RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
			@RequestParam(value = "page", defaultValue = "0") int page) {
		Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
		PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
		Page<SolrSample> results = solrSampleRepository.findByTextAndGroups(searchTerm, groupAccession,
				querySpec);
		ResultQuery<SolrSample> rq = new SampleResultQuery(results);
		return rq.renderDocument();
	}

//	@RequestMapping(value = "groupsamples/{accession}", produces = MediaType.APPLICATION_JSON_VALUE, method = RequestMethod.GET)
//	public @ResponseBody Page<SolrSample> samplesInGroup(@PathVariable(value = "accession") String groupAccession,
//			@RequestParam(value = "query", defaultValue = "*:*") String searchTerm,
//			@RequestParam(value = "sortby", defaultValue = "score") String sortBy,
//			@RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
//			@RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
//			@RequestParam(value = "page", defaultValue = "0") int page) {
//
//		Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
//		PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
//		return solrSampleRepository.findByKeywordsAndGroupsContains(searchTerm, groupAccession, querySpec);
//	}

	@ExceptionHandler(APIXMLNotFoundException.class)
	@ResponseStatus(HttpStatus.NOT_FOUND)
	public ResponseEntity<String> handleAXNFE(APIXMLNotFoundException e) {
		log.error("There is no XML available for this accession - return NOT_FOUND response", e);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.TEXT_PLAIN);
		return new ResponseEntity<>("There is no XML available for this accession: " + e.getMessage(), headers,
				HttpStatus.NOT_FOUND);
	}

	@ExceptionHandler(RequestParameterSyntaxException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseEntity<String> handleRPSE(RequestParameterSyntaxException e) {
		log.error("Failed to parse legacy query request", e);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.TEXT_PLAIN);
		return new ResponseEntity<>("Could not interpret query request: " + e.getMessage(), headers,
				HttpStatus.BAD_REQUEST);
	}
}
