package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.spot.biosamples.model.Group;
import uk.ac.ebi.spot.biosamples.model.ResultQuery;
import uk.ac.ebi.spot.biosamples.model.Sample;
import uk.ac.ebi.spot.biosamples.repository.GroupRepository;
import uk.ac.ebi.spot.biosamples.repository.SampleRepository;


import java.util.HashMap;
import java.util.Map;

/**
 * Created by lucacherubin on 2016/05/05.
 */
@Controller
public class LegacyApiController {
    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private SampleRepository sampleRepository;


    @RequestMapping(value = "xml/group/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String legacyGroupXmlQueryRedirect(@PathVariable String query){
        Map<String,String> paramMap = getCustomQueryParam(query);
        return groupXmlQuery(
                paramMap.get("query"),
                paramMap.get("sortby"),
                paramMap.get("sortorder"),
                Integer.parseInt(paramMap.get("pagesize")),
                Integer.parseInt(paramMap.get("page")));

    }

    @RequestMapping(value = "xml/sample/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String legacySampleXmlQueryRedirect(@PathVariable String query){
        Map<String,String> paramMap = getCustomQueryParam(query);
        return sampleXmlQuery(
                paramMap.get("query"),
                paramMap.get("sortby"),
                paramMap.get("sortorder"),
                Integer.parseInt(paramMap.get("pagesize")),
                Integer.parseInt(paramMap.get("page")));

    }
    @RequestMapping(value = "xml/groupsamples/{accession}/query={query}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String legacySampleInGroupXmlQueryRedirect(@PathVariable String accession, @PathVariable String query){
        Map<String,String> paramMap = getCustomQueryParam(query);
        return sampleInGroupXmlQuery(
                accession,
                paramMap.get("query"),
                paramMap.get("sortby"),
                paramMap.get("sortorder"),
                Integer.parseInt(paramMap.get("pagesize")),
                Integer.parseInt(paramMap.get("page")));

    }

    @RequestMapping(value = "xml/group", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody
    String groupXmlQuery(
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "10") int pageSize,
            @RequestParam(value = "page", defaultValue = "1") int page)
    {

        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder),sortBy);
        PageRequest querySpec = new PageRequest(page,pageSize,sortingMethod);
        Page<Group> results = groupRepository.find(searchTerm,querySpec);
        ResultQuery rq = new ResultQuery(results);
        return rq.renderDocument();
    }

    @RequestMapping(value = "xml/groupsamples/{accession}", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleInGroupXmlQuery(
            @PathVariable(value = "accession") String groupAccession,
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "10") int pageSize,
            @RequestParam(value = "page", defaultValue = "1") int page)
    {

        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder),sortBy);
        PageRequest querySpec = new PageRequest(page,pageSize,sortingMethod);
        Page<Sample> results = sampleRepository.findTermInGroup(searchTerm, groupAccession,querySpec);
        ResultQuery rq = new ResultQuery(results);
        return rq.renderDocument();
    }

    @RequestMapping(value = "xml/sample", produces = MediaType.TEXT_XML_VALUE, method = RequestMethod.GET)
    public @ResponseBody String sampleXmlQuery(
            @RequestParam(value = "query") String searchTerm,
            @RequestParam(value = "sortby", defaultValue = "score") String sortBy,
            @RequestParam(value = "sortorder", defaultValue = "desc") String sortOrder,
            @RequestParam(value = "pagesize", defaultValue = "10") int pageSize,
            @RequestParam(value = "page", defaultValue = "1") int page)
    {

        Sort sortingMethod = new Sort(Sort.Direction.fromString(sortOrder),sortBy);
        PageRequest querySpec = new PageRequest(page,pageSize,sortingMethod);
        Page<Sample> results = sampleRepository.find(searchTerm,querySpec);
        ResultQuery rq = new ResultQuery(results);
        return rq.renderDocument();

    }

    private Map<String,String> getDefaultQueryParam() {
        Map<String,String> defaultQueryParam = new HashMap<>();
        defaultQueryParam.put("query","");
        defaultQueryParam.put("sortby","score");
        defaultQueryParam.put("sortorder","desc");
        defaultQueryParam.put("pagesize","10");
        defaultQueryParam.put("page","1");
        return defaultQueryParam;
    }

    private Map<String,String> getCustomQueryParam(String customQuery) {
        //TODO Check for query param that is not read correctly because is the only one not having a "key"
        String[] paramPairs = customQuery.split("&");
        Map<String,String> customParam = getDefaultQueryParam();
        for(String pair: paramPairs) {
            String[] keyValue = pair.split("=");
            if(keyValue.length == 1) {
                customParam.put("query",keyValue[0]);
            } else {
                customParam.put(keyValue[0],keyValue[1]);
            }
        }

        customParam = normalizeParam(customParam);

        return customParam;
    }

    private Map<String,String> normalizeParam(Map<String,String> customParam) {


        if (customParam.get("sortby").matches("relevance")) {
            customParam.put("sortby","score");
        }

        if (customParam.get("sortorder").matches("descending")) {
            customParam.put("sortorder","desc");
        }

        return customParam;
    }
}
