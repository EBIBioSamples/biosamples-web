package uk.ac.ebi.spot.biosamples.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.repository.Query;
import org.springframework.data.solr.repository.SolrCrudRepository;
import uk.ac.ebi.spot.biosamples.model.Sample;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
public interface SampleRepository extends SolrCrudRepository<Sample, String> {

    @Query(value = "?0", fields = { "accession"} )
    Page<Sample> find(String keyword, Pageable page);

    @Query(value = "?0", filters = { "sample_grp_accessions:?1"}, fields = { "accession"})
    Page<Sample> findTermInGroup(String keyword, String groupAccesion, Pageable page);
}
