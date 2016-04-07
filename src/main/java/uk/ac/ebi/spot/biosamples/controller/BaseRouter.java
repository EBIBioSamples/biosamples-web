package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Javadocs go here!
 *
 * @author lucacherubin
 * @date 18/03/2016
 */
@Controller
//@RequestMapping("/biosamples")
public class BaseRouter {

    @RequestMapping("/")
    public String index() {
        return "home";
    }

//    @RequestMapping("/search")
//    public String search() {
//        return "search";
//    }

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
