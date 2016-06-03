package uk.ac.ebi.spot.biosamples.model.xml;

import org.springframework.data.domain.Page;
import uk.ac.ebi.spot.biosamples.model.solr.Group;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 03/06/16
 */
public class GroupResultQuery extends ResultQuery<Group> {
    public GroupResultQuery(Page<Group> results) {
        super(results);
    }

    @Override protected String getDocumentType(Group result) {
        return "BioSampleGroup";
    }

    @Override protected String getAccession(Group result) {
        return result.getAccession();
    }
}
