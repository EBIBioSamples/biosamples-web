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
import uk.ac.ebi.spot.biosamples.model.solr.Group;
import uk.ac.ebi.spot.biosamples.model.xml.GroupResultQuery;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQuery;
import uk.ac.ebi.spot.biosamples.repository.GroupRepository;

import java.util.Map;

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

    @RequestMapping(value = "xml/group", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String groupXmlQuery(
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
            @RequestParam(value = "page", defaultValue = "0") int page) {
        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder),sortBy);
        PageRequest querySpec = new PageRequest(page,pageSize,sortingMethod);
//        Page<Group> results = groupRepository.findByAccession(searchTerm,querySpec);
        Page<Group> results = groupRepository.findByKeywords(searchTerm,querySpec);
        ResultQuery rq = new GroupResultQuery(results);
        return rq.renderDocument();
    }

    @RequestMapping(value = "xml/group/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String legacyGroupXmlQueryRedirect(@PathVariable String query){
        Map<String,String> paramMap = LegacyApiQueryParser.parseLegacyQueryFormat(query);
        return groupXmlQuery(
                paramMap.get("query"),
                paramMap.get("sortby"),
                paramMap.get("sortorder"),
                Integer.parseInt(paramMap.get("pagesize")),
                Integer.parseInt(paramMap.get("page")));

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
