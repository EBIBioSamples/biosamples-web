package uk.ac.ebi.spot.biosamples.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.repository.Query;
import org.springframework.data.solr.repository.SolrCrudRepository;
import uk.ac.ebi.spot.biosamples.model.Group;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 25/02/16
 */
public interface GroupRepository extends SolrCrudRepository<Group, String> {

    @Query(value = "?0", fields = {"accession"})
    Page<Group> find(String keyword, Pageable page);
}
