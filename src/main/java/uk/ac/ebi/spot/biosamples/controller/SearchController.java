package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
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
    public String search(Model model, String searchTerm) {
        model.addAttribute("searchTerm",searchTerm);
        return "search";
    }

//    @RequestMapping("/test")
//    public String test(Model model) {
//        String[] tempValues = {"Hello","World","This","Is","Me"};
//        model.addAttribute("temp",tempValues);
//        return "searchComponents :: test";
//    }


}
