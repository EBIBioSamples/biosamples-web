package uk.ac.ebi.spot.biosamples.service;

import org.springframework.hateoas.Link;
import org.springframework.hateoas.mvc.BasicLinkBuilder;
import org.springframework.stereotype.Component;

import uk.ac.ebi.spot.biosamples.model.neo4j.NeoGroup;
import uk.ac.ebi.spot.biosamples.model.neo4j.NeoSample;
import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;

@Component
public class ApiLinkFactory {

    public Link createRelationsLinkForSample(SolrSample sample) {    	
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("samplesrelations").slash(sample.getAccession()).withRel("relations");
    }

    public Link createRelationsLinkForGroup(SolrGroup group) {
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("groupsrelations").slash(group.getAccession()).withRel("relations");
    }

    public Link createDetailsLinkForSample(NeoSample sample) {
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("samples").slash(sample.getAccession()).withRel("details");
    }

    public Link createDetailsLinkForGroup(NeoGroup group) {
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("groups").slash(group.getAccession()).withRel("details");
    }

}
