package uk.ac.ebi.spot.biosamples.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import uk.ac.ebi.spot.biosamples.service.mail.FeedbackMailService;

@Controller
public class SupportController {

    @Autowired
    private FeedbackMailService mailService;

    @RequestMapping(value="/feedback", method = RequestMethod.POST)
    @ResponseBody
    public String sendFeedback(@RequestParam("m") String message,
                        @RequestParam("e") String email,
                        @RequestParam("p") String page,
                        @RequestParam("r") String reference) {
        String feedbackContent = String.format(
                "A new feedback has been submitted related to %s page - reference %s\n\n%s",
                page,reference,message
                );
        String feedbackAuthor = email.isEmpty() ? "A generic user" : email;
        mailService.sendFeedbackMail(feedbackContent, feedbackAuthor);
        return feedbackContent;
    }
}
