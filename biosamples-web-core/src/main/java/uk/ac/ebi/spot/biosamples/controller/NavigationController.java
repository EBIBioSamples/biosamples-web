package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;

/**
 * Javadocs go here!
 *
 * @author lucacherubin
 * @date 18/03/2016
 */
@Controller
public class NavigationController {

    @RequestMapping("/")
    public String index(Model model, String searchTerm) {
        model.addAttribute("searchTerm", searchTerm);
        return "index";
    }

}
