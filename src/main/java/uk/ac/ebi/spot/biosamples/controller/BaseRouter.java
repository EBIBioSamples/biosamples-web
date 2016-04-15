package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import uk.ac.ebi.spot.biosamples.model.Breadcrumb;

import javax.servlet.http.HttpServletRequest;

/**
 * Javadocs go here!
 *
 * @author lucacherubin
 * @date 18/03/2016
 */
@Controller
public class BaseRouter {

    @RequestMapping("/")
    public String index() {
        return "home";
    }

    @RequestMapping("/search")
    public String search(Model model, String searchTerm, HttpServletRequest request) {
        model.addAttribute("searchTerm",searchTerm);
        return "search";
    }

    @RequestMapping("/samples")
    public String samples() {
        return "samples_home";
    }

    @RequestMapping("/groups")
    public String groups() {
        return "groups_home";
    }

    @RequestMapping("/help")
    public String help() {
        return "help";
    }

    @RequestMapping("/help/submit")
    public String helpSubmit() {
        return "help_submit";
    }
    @RequestMapping("/about")
    public String about() {
        return "about";
    }
}