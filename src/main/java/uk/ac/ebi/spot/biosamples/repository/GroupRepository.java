package uk.ac.ebi.spot.biosamples.repository;

import org.springframework.data.solr.repository.SolrCrudRepository;
import uk.ac.ebi.spot.biosamples.model.Group;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 25/02/16
 */
public interface GroupRepository extends SolrCrudRepository<Group, String> {
}
