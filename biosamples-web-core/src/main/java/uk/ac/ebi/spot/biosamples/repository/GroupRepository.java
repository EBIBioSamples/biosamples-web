package uk.ac.ebi.spot.biosamples.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.solr.repository.Query;
import org.springframework.data.solr.repository.SolrCrudRepository;

import uk.ac.ebi.spot.biosamples.model.solr.Group;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 25/02/16
 */
public interface GroupRepository extends ReadOnlySolrRepository<Group, String> {
    Page<Group> findByAccession(@Param("accession") String accession, Pageable page);
}
