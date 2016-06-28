package uk.ac.ebi.spot.biosamples;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 28/06/16
 */
@Configuration
public class BiosamplesWebCbiConfiguration extends WebMvcConfigurerAdapter {
    @Override public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/search").setViewName("search-results");
    }
}
