package uk.ac.ebi.spot.biosamples;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 07/06/16
 */
@Configuration
public class BiosamplesWebEBIConfiguration extends WebMvcConfigurerAdapter {
    @Override public void addViewControllers(ViewControllerRegistry registry) {
//        registry.addViewController("/samples").setViewName("samples_home");
//        registry.addViewController("/groups").setViewName("groups_home");
        registry.addViewController("/help").setViewName("help");
        registry.addViewController("/about").setViewName("about");
    }
}
