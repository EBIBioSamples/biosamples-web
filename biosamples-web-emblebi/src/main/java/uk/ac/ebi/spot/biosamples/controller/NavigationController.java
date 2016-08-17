package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Optional;


@Controller
public class NavigationController {
    @RequestMapping("/search")
    public String search(Model model, String searchTerm) {
        model.addAttribute("searchTerm", searchTerm);
        return "search";
    }

//    @RequestMapping("/")
//    public String index(){
//        return "home";
//    }

    @RequestMapping(value = {"/help/{page}", "/help"})
    public String helpInnerPage(@PathVariable("page") Optional<String> innerPage) {
        if (innerPage.isPresent()) {
            return "help/" + innerPage.get();
        } else {
            return "help/index";
        }

    }
}
