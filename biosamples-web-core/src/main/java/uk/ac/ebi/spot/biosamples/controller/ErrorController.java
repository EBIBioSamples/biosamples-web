package uk.ac.ebi.spot.biosamples.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.expression.spel.SpelEvaluationException;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
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
    public String handleNotFoundError(Model model, HttpServletRequest req, Exception exception)
            throws Exception {

        getLog().error("Request: " + req.getRequestURI() + " raised " + exception);
        model.addAttribute("exception", exception);
        model.addAttribute("url", req.getRequestURL());
        model.addAttribute("timestamp", new Date().toString());
        model.addAttribute("status", HttpStatus.NOT_FOUND.value());
        return "error";

    }


    @ExceptionHandler(value = Exception.class)
    public ModelAndView defaultErrorHandler(HttpServletRequest req, Exception e) throws Exception {
        // If the exception is annotated with @ResponseStatus rethrow it and let
        // the framework handle it - like the OrderNotFoundException example
        // at the start of this post.
        // AnnotationUtils is a Spring Framework utility class.
        if (AnnotationUtils.findAnnotation
                (e.getClass(), ResponseStatus.class) != null)
        throw e;

        // Otherwise setup and send the user to a default error-view.
        ModelAndView mav = new ModelAndView();
        mav.addObject("exception", e);
        mav.addObject("url", req.getRequestURL());
        mav.setViewName("error");
        return mav;
    }


}
