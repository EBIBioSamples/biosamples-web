package uk.ac.ebi.spot.biosamples.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.hateoas.Link;
import org.springframework.stereotype.Component;
import uk.ac.ebi.spot.biosamples.model.solr.Group;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 15/06/16
 */
@Component
public class RelationsLinkFactory {
    @Value("${relations.server:http://localhost:8080/}")
    private String relationsServerUrl;

    public Link createRelationsLinkForSample(Sample sample) {
        return new Link(relationsServerUrl + "/samples/" + sample.getAccession(), "relations");
    }

    public Link createRelationsLinkForGroup(Group group) {
        return new Link(relationsServerUrl + "/groups/" + group.getAccession(), "relations");
    }
}
