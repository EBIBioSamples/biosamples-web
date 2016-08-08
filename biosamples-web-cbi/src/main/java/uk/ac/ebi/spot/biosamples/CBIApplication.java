package uk.ac.ebi.spot.biosamples;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;

@SpringBootApplication
public class CBIApplication extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(CBIApplication.class, args);
    }
}