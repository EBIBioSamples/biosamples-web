package uk.ac.ebi.spot.biosamples.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.mvc.BasicLinkBuilder;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.stereotype.Component;

import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;

@Component
public class RelationsLinkFactory {

    public Link createRelationsLinkForSample(SolrSample sample) {    	
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("samplesrelations").slash(sample.getAccession()).withRel("relations");
    }

    public Link createRelationsLinkForGroup(SolrGroup group) {
    	return BasicLinkBuilder.linkToCurrentMapping().slash("api").slash("groupsrelations").slash(group.getAccession()).withRel("relations");
    }
}
