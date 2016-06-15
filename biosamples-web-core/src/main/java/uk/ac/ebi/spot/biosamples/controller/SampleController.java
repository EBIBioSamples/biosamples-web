package uk.ac.ebi.spot.biosamples.controller;

import org.json.simple.JSONObject;
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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import uk.ac.ebi.spot.biosamples.controller.utils.LegacyApiQueryParser;
import uk.ac.ebi.spot.biosamples.exception.APIXMLNotFoundException;
import uk.ac.ebi.spot.biosamples.exception.RequestParameterSyntaxException;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQuery;
import uk.ac.ebi.spot.biosamples.model.xml.SampleResultQuery;
import uk.ac.ebi.spot.biosamples.repository.SampleRepository;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 12/02/16
 */
@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class SampleController {
    @Autowired private SampleRepository sampleRepository;

    @Value("${relations.server:http://www.ebi.ac.uk/biosamples/relations}")
    private String relationsServer;

    private RestTemplate restTemplate = new RestTemplate();

    private final Logger log = LoggerFactory.getLogger(getClass());

    protected Logger getLog() {
        return log;
    }

    @RequestMapping(value = "samples/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
    public String sample(Model model, @PathVariable String accession, HttpServletRequest request) {
        Sample sample = sampleRepository.findOne(accession);
        model.addAttribute("sample", sample);

        //This parses the current URL and adds the bits to reach the relations endpoint
        String currentURL = request.getRequestURL().toString();
        String relationsURL =
                currentURL.substring(0, currentURL.indexOf("/samples/")) + "/samples/" + accession + "/biosamplesWeb";

        RestTemplate restTemplate = new RestTemplate();
        try {
            JSONObject result = restTemplate.getForObject(relationsURL, JSONObject.class);
            model.addAttribute("derivedFrom", result.get("derivedFrom"));
            model.addAttribute("derivedTo", result.get("derivedTo"));
            model.addAttribute("childOf", result.get("childOf"));
            model.addAttribute("parentOf", result.get("parentOf"));
            model.addAttribute("sameAs", result.get("sameAs"));
            model.addAttribute("curatedInto", result.get("ReCuratedInto"));
            model.addAttribute("curatedFrom", result.get("ReCuratedFrom"));
        }
        catch (RestClientException e) {
            getLog().error("Failed to retrieve relations data from '" + relationsURL + "'", e);
        }
        return "sample";
    }

    @RequestMapping(value = "samples/{accession}",
                    produces = MediaType.APPLICATION_JSON_UTF8_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody Sample sampleJson(@PathVariable String accession) {
        return sampleRepository.findOne(accession);
    }

    @RequestMapping(value = "samples/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleXml(@PathVariable String accession) {
        Sample sample = sampleRepository.findOne(accession);
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
        Page<Sample> results = sampleRepository.findByAccession(searchTerm, querySpec);
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
        Page<Sample> results = sampleRepository.findByKeywordsAndGroupsContains(searchTerm, groupAccession, querySpec);
        ResultQuery rq = new SampleResultQuery(results);
        return rq.renderDocument();
    }

    @ExceptionHandler(NullPointerException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleNPE(NullPointerException e) {
        getLog().error("There is no data available for this accession - return NOT_FOUND response", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("There is no data available for this accession: " + e.getMessage(), headers, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(APIXMLNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleAXNFE(NullPointerException e) {
        getLog().error("There is no XML available for this accession - return NOT_FOUND response", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("There is no XML available for this accession: " + e.getMessage(), headers, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RequestParameterSyntaxException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleRPSE(RequestParameterSyntaxException e) {
        getLog().error("Failed to parse legacy query request", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("Could not interpret query request: " + e.getMessage(),
                                    headers,
                                    HttpStatus.BAD_REQUEST);
    }
}
