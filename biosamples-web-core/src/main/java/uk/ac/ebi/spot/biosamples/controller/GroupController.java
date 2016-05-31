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
import org.springframework.web.bind.annotation.*;

import uk.ac.ebi.spot.biosamples.model.solr.Group;
import uk.ac.ebi.spot.biosamples.repository.GroupRepository;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 25/02/16
 */
@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class GroupController {
    @Autowired private GroupRepository groupRepository;

    @RequestMapping(value = "group/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
    public String group(Model model, @PathVariable String accession) {
        Group group = groupRepository.findOne(accession);
        model.addAttribute("group", group);
        return "group";
    }

    @RequestMapping(value = "group/{accession}",
                    produces = MediaType.APPLICATION_JSON_UTF8_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody Group groupJson(@PathVariable String accession) {
        return groupRepository.findOne(accession);
    }

    @RequestMapping(value = "group/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String groupXmlRedirect(@PathVariable String accession) {
        return groupXml(accession);
    }

    @RequestMapping(value = "xml/group/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String groupXml(@PathVariable String accession) {
        Group group = groupRepository.findOne(accession);
        if (group.getXml().isEmpty()) {
            throw new NullPointerException("No XML present for " + group.getAccession());
        }
        else {
            return group.getXml();
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
