package uk.ac.ebi.spot.biosamples.controller;

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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import uk.ac.ebi.spot.biosamples.controller.utils.LegacyApiQueryParser;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQuery;
import uk.ac.ebi.spot.biosamples.model.xml.SampleResultQuery;
import uk.ac.ebi.spot.biosamples.repository.SampleRepository;

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

    @RequestMapping(value = "sample/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
    public String sample(Model model, @PathVariable String accession) {
        Sample sample = sampleRepository.findOne(accession);
        model.addAttribute("sample", sample);
        return "sample";
    }

    @RequestMapping(value = "sample/{accession}",
                    produces = MediaType.APPLICATION_JSON_UTF8_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody Sample sampleJson(@PathVariable String accession) {
        return sampleRepository.findOne(accession);
    }

    @RequestMapping(value = "sample/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleXmlRedirect(@PathVariable String accession) {
        return sampleXml(accession);
    }

    @RequestMapping(value = "xml/sample/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleXml(@PathVariable String accession) {
        Sample sample = sampleRepository.findOne(accession);
        if (sample.getXml().isEmpty()) {
            throw new NullPointerException("No XML present for " + sample.getAccession());
        }
        else {
            return sample.getXml();
        }
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
            @RequestParam(value = "pagesize", defaultValue = "10") int pageSize,
            @RequestParam(value = "page", defaultValue = "1") int page) {
        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
        PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
        Page<Sample> results = sampleRepository.findByAccessionAndGroupsContains(searchTerm, groupAccession, querySpec);
        ResultQuery rq = new SampleResultQuery(results);
        return rq.renderDocument();
    }

    @RequestMapping(value = "xml/sample", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleXmlQuery(
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "10") int pageSize,
            @RequestParam(value = "page", defaultValue = "1") int page) {
        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder), sortBy);
        PageRequest querySpec = new PageRequest(page, pageSize, sortingMethod);
        Page<Sample> results = sampleRepository.findByAccession(searchTerm, querySpec);
        ResultQuery rq = new SampleResultQuery(results);
        return rq.renderDocument();
    }

    @ExceptionHandler(NullPointerException.class)
    @ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
    public ResponseEntity<String> handleNPE(NullPointerException e) {
        e.printStackTrace();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("There is no XML available for this accession", headers, HttpStatus.NOT_ACCEPTABLE);
    }
}
