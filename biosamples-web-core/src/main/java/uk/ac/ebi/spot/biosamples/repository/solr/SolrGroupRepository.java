package uk.ac.ebi.spot.biosamples.repository.solr;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 25/02/16
 */
public interface SolrGroupRepository extends ReadOnlySolrRepository<SolrGroup, String> {
    Page<SolrGroup> findByAccession(@Param("accession") String accession, Pageable page);

    Page<SolrGroup> findByKeywords(@Param("keyword") String keyword, Pageable page);


}
