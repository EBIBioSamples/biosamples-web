package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Javadocs go here!
 *
 * @author lucacherubin
 * @date 08/03/2016
 */
@Controller
public class SearchController {

    @RequestMapping("/search")
    public String search() {
        return "search";
    }


}
