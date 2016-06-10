package uk.ac.ebi.spot.biosamples.controller;

import org.apache.http.client.utils.URIBuilder;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.client.RestTemplate;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;
import uk.ac.ebi.spot.biosamples.repository.SampleRepository;

import java.net.URISyntaxException;
import java.net.URL;

import javax.servlet.http.HttpServletRequest;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 12/02/16
 */
@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class SampleController {
    @Autowired 
    private SampleRepository sampleRepository;

    @Value("${relations.server:http://localhost:8080/}")
    private String relationsServer;

    
    private RestTemplate restTemplate = new RestTemplate();
    
    @RequestMapping(value = "sample/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
    public String sample(Model model, @PathVariable String accession, HttpServletRequest request) throws URISyntaxException {
        Sample sample = sampleRepository.findOne(accession);
        model.addAttribute("sample", sample);


        //This parses the configured URL and adds the bits to reach the relations endpoint
        URIBuilder uriBuilder = new URIBuilder(relationsServer);
        uriBuilder.setPath(uriBuilder.getPath()+"/samples/"+accession+"/biosamplesWeb");
        
        JSONObject result = restTemplate.getForObject(uriBuilder.build(), JSONObject.class);

        model.addAttribute("derivedFrom",result.get("derivedFrom"));
        model.addAttribute("derivedTo",result.get("derivedTo"));
        model.addAttribute("childOf",result.get("childOf"));
        model.addAttribute("parentOf",result.get("parentOf"));
        model.addAttribute("sameAs",result.get("sameAs"));
        model.addAttribute("curatedInto",result.get("ReCuratedInto"));
        model.addAttribute("curatedFrom",result.get("ReCuratedFrom"));

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

    @ExceptionHandler(NullPointerException.class)
    @ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
    public ResponseEntity<String> handleNPE(NullPointerException e) {
        e.printStackTrace();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("There is no XML available for this accession", headers, HttpStatus.NOT_ACCEPTABLE);
    }
}
