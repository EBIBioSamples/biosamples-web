package uk.ac.ebi.spot.biosamples.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import uk.ac.ebi.spot.biosamples.exception.HtmlContentNotFoundException;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;


@ControllerAdvice
public class CustomErrorController{

    private final Logger log = LoggerFactory.getLogger(getClass());

    @ExceptionHandler(HtmlContentNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleNotFoundError(Model model, HttpServletRequest req, Exception exception)
            throws Exception {

        log.error("Problem with: " + req.getRequestURI(), exception);
        model.addAttribute("exception", exception);
        model.addAttribute("url", req.getRequestURL());
        model.addAttribute("timestamp", new Date().toString());
        model.addAttribute("status", HttpStatus.NOT_FOUND.value());
        return "error";

    }


    //currently not working, see  BSD-687 
    @ExceptionHandler(value = Exception.class)
    public ModelAndView defaultErrorHandler(HttpServletRequest req, Exception exception) throws Exception {

        log.error("Problem with: " + req.getRequestURI(), exception);
        // If the exception is annotated with @ResponseStatus rethrow it and let
        // the framework handle it - like the OrderNotFoundException example
        // at the start of this post.
        // AnnotationUtils is a Spring Framework utility class.
        if (AnnotationUtils.findAnnotation
                (exception.getClass(), ResponseStatus.class) != null)
        throw exception;

        // Otherwise setup and send the user to a default error-view.
        ModelAndView mav = new ModelAndView();
        mav.addObject("exception", exception);
        mav.addObject("url", req.getRequestURL());
        mav.setViewName("error");
        return mav;
    }

}