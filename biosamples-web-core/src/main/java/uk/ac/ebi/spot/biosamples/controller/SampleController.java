package uk.ac.ebi.spot.biosamples.controller;

import org.apache.http.client.utils.URIBuilder;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

import javax.servlet.http.HttpServletRequest;

@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class SampleController {

	private Logger log = LoggerFactory.getLogger(getClass());
	
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
        //TODO Add some sort of caching here... Google Guava?
        URIBuilder uriBuilder = new URIBuilder(relationsServer);
        uriBuilder.setPath(uriBuilder.getPath()+"/samples/"+accession+"/biosamplesWeb");
        
        URI uri = uriBuilder.build();
        log.info("Getting relations from "+uri);
        SampleRelationsWrapper result = restTemplate.getForObject(uri, SampleRelationsWrapper.class);
        Boolean sampleHasRelations = !sample.getGroups().isEmpty() || result.hasRelations();

        //TODO derivedFrom/To display the other way around for some reason? correct in relations output, but wrong here
        model.addAttribute("derivedFrom",result.getDerivedFrom());
        model.addAttribute("derivedTo",result.getDerivedTo());
        model.addAttribute("childOf",result.getChildOf());
        model.addAttribute("parentOf",result.getParentOf());
        model.addAttribute("sameAs",result.getSameAs());
        model.addAttribute("recuratedInto",result.getRecuratedInto());
        model.addAttribute("recuratedFrom",result.getRecuratedFrom());
        model.addAttribute("hasRelations", sampleHasRelations);

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
        if (sample == null || sample.getXml() == null || sample.getXml().isEmpty()) {
            throw new APIXMLNotFoundException();
        }
        else {
            return sample.getXml();
        }
    }
    
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    private class APIXMLNotFoundException extends RuntimeException {
		private static final long serialVersionUID = -5929037398365356631L;
    }
}
