package uk.ac.ebi.spot.biosamples.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.mvc.BasicLinkBuilder;
import org.springframework.stereotype.Component;

import uk.ac.ebi.spot.biosamples.model.neo4j.NeoGroup;
import uk.ac.ebi.spot.biosamples.model.neo4j.NeoSample;

@Component
public class ApiLinkFactory {

    public Link createApiLinkForSample(NeoSample sample) {
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("samples").slash(sample.getAccession()).withRel("details");
    }

    public Link createApiLinkForGroup(NeoGroup group) {
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("groups").slash(group.getAccession()).withRel("details");
    }

}
