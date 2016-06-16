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
    @Value("${relations.server:http://www.ebi.ac.uk/biosamples/relations}")
    private String relationsServerUrl;

    public Link createRelationsLinkForSample(Sample sample) {
        String url = relationsServerUrl + (relationsServerUrl.endsWith("/") ? "samples/" : "/samples/") +
                sample.getAccession();
        return new Link(url, "relations");
    }

    public Link createRelationsLinkForGroup(Group group) {
        String url =
                relationsServerUrl + (relationsServerUrl.endsWith("/") ? "groups/" : "/groups/") + group.getAccession();
        return new Link(url, "relations");
    }
}
