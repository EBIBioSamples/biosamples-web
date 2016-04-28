package uk.ac.ebi.spot.biosamples;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.web.SpringBootServletInitializer;

@SpringBootApplication
public class BiosamplesWebApplication {
    public static void main(String[] args) {
        SpringApplication.run(BiosamplesWebApplication.class, args);
    }
}
