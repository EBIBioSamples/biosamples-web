package uk.ac.ebi.spot.biosamples.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.expression.spel.SpelEvaluationException;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.util.NestedServletException;
import org.thymeleaf.exceptions.TemplateProcessingException;
import uk.ac.ebi.spot.biosamples.exception.HtmlContentNotFound;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;

/**
 * Created by lucacherubin on 2016/07/06.
 */
@ControllerAdvice
public class ErrorController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    protected Logger getLog() {
        return log;
    }

    @ExceptionHandler(HtmlContentNotFound.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleError(Model model, HttpServletRequest req, Exception exception)
            throws Exception {


        getLog().error("Request: " + req.getRequestURI() + " raised " + exception);

        model.addAttribute("exception", exception);
        model.addAttribute("url", req.getRequestURL());
        model.addAttribute("timestamp", new Date().toString());
        model.addAttribute("status", HttpStatus.NOT_FOUND.value());
        return "error";
    }

}
