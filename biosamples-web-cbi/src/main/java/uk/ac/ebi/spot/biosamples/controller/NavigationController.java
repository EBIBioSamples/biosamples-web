package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import uk.ac.ebi.spot.biosamples.model.Breadcrumb;

import javax.servlet.http.HttpServletRequest;

@Controller
public class NavigationController {

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


    @RequestMapping("/about")
    public String about() {
        return "about";
    }
}
