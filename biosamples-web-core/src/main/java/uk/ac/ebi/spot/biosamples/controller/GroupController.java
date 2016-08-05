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
import uk.ac.ebi.spot.biosamples.exception.HtmlContentNotFound;
import uk.ac.ebi.spot.biosamples.exception.RequestParameterSyntaxException;
import uk.ac.ebi.spot.biosamples.model.solr.Group;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;
import uk.ac.ebi.spot.biosamples.model.xml.GroupResultQuery;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQuery;
import uk.ac.ebi.spot.biosamples.repository.GroupRepository;
import uk.ac.ebi.spot.biosamples.repository.SampleRepository;
import uk.ac.ebi.spot.biosamples.service.HttpSolrDispatcher;

import java.util.*;

@Controller
@CrossOrigin(methods = RequestMethod.GET)
public class GroupController {
    @Autowired private GroupRepository groupRepository;

    @Autowired private SampleRepository sampleRepository;

    @Autowired private HttpSolrDispatcher httpSolrDispatcher;

    @Value("${relations.server:http://www.ebi.ac.uk/biosamples/relations}")
    private String relationsServerUrl;

    private final Logger log = LoggerFactory.getLogger(getClass());

    protected Logger getLog() {
        return log;
    }

    @RequestMapping(value = "groups/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
    public String group(Model model, @PathVariable String accession) {
        Group group = groupRepository.findOne(accession);

        if (group != null) {

            model.addAttribute("group", group);
            model.addAttribute("relationsUrl", relationsServerUrl);
            if ( group.hasSamples() ) {
                // Sample common attributes
                Set<String> tempSampleCommonCharacteristics = httpSolrDispatcher.getGroupCommonAttributes(accession, Integer.parseInt(group.getNumberOfSamples()));
                Sample sample = sampleRepository.findFirstByGroupsContains(accession);
                Map<String, List<String>> sampleCrts = sample.getCharacteristics();
                TreeMap<String, List<String>> sampleCommonAttributes = new TreeMap<>();
                for (String attribute : tempSampleCommonCharacteristics) {
                    List<String> crtValues = sampleCrts.get(attribute.replaceFirst("_crt_ft$", ""));
                    sampleCommonAttributes.put(cleanAttributeName(attribute), crtValues);
                }
                model.addAttribute("common_attrs", sampleCommonAttributes);

                // Samples table attributes
                Set<String> allGroupSamplesCharacteristics = httpSolrDispatcher.getGroupSamplesAttributes(accession);

                List<String> tableAttributes = new ArrayList<>();

                Arrays.stream(new String[]{"accession", "organism", "name", "description"})
                        .filter(attr -> !sampleCommonAttributes.containsKey(attr))
                        .forEach(tableAttributes::add);
                allGroupSamplesCharacteristics.stream()
                        .map(this::cleanAttributeName)
                        .filter(attr -> !sampleCommonAttributes.containsKey(attr))
                        .forEach(tableAttributes::add);

                model.addAttribute("table_attrs", tableAttributes);
            }
            return "group";
        } else {
            throw new HtmlContentNotFound("No group has been found with accession " + accession);
        }
    }

    @RequestMapping(value = "groups/{accession}",
                    produces = MediaType.APPLICATION_JSON_UTF8_VALUE,
                    method = RequestMethod.GET)
    public @ResponseBody Group groupJson(@PathVariable String accession) {
        return groupRepository.findOne(accession);
    }

    @RequestMapping(value = "groups/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String groupXml(@PathVariable String accession) {
        Group group = groupRepository.findOne(accession);

        if (group.getXml().isEmpty()) {
            throw new NullPointerException("No XML present for " + group.getAccession());
        }
        else {
            return group.getXml();
        }
    }

    @RequestMapping(value = "xml/groups", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String groupXmlQuery(
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "25") int pageSize,
            @RequestParam(value = "page", defaultValue = "0") int page) {
        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder),sortBy);
        PageRequest querySpec = new PageRequest(page,pageSize,sortingMethod);
        Page<Group> results = groupRepository.findByKeywords(searchTerm,querySpec);
        ResultQuery rq = new GroupResultQuery(results);
        return rq.renderDocument();
    }

    @RequestMapping(value = "xml/groups/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String hybridGroupXml(@PathVariable String accession) {
        return groupXml(accession);
    }

    @RequestMapping(value = "xml/group/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String legacyGroupXml(@PathVariable String accession) {
        return groupXml(accession);
    }

    @RequestMapping(value = "xml/groups/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
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
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<String> handleNPE(NullPointerException e) {
        getLog().error("There is no XML available for this accession - return NOT_FOUND response", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("There is no XML available for this accession", headers, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(RequestParameterSyntaxException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleRPSE(RequestParameterSyntaxException e) {
        getLog().error("Failed to parse legacy query request", e);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        return new ResponseEntity<>("Could not interpret query request: " + e.getMessage(), headers, HttpStatus.BAD_REQUEST);
    }

    private String cleanAttributeName(String name) {
        name = name.substring(0, name.indexOf("_crt_ft"));
        return name;
        /*
        return Arrays.stream(name.split("_")).map(part -> {
            return part.substring(0, 1).toUpperCase() + part.substring(1, part.length()).toLowerCase();
        }).collect(Collectors.joining(" "));
        */
    }
}
