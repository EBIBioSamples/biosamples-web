package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import uk.ac.ebi.spot.biosamples.model.Sample;
import uk.ac.ebi.spot.biosamples.repository.SampleRepository;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 12/02/16
 */
@Controller
@RequestMapping("/content/samples")
public class SampleController {
    @Autowired private SampleRepository sampleRepository;

    @RequestMapping(value = "/{accession}", produces = MediaType.TEXT_HTML_VALUE, method = RequestMethod.GET)
    public String sample(Model model, @PathVariable String accession) {
        Sample sample = sampleRepository.findOne(accession);
        model.addAttribute("sample", sample);
        return "sample";
    }
}
