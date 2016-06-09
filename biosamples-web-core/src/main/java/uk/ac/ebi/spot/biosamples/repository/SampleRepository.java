package uk.ac.ebi.spot.biosamples.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.data.solr.repository.Query;
import org.springframework.data.solr.repository.SolrCrudRepository;

import uk.ac.ebi.spot.biosamples.model.solr.Sample;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
public interface SampleRepository extends SolrCrudRepository<Sample, String> {
    Page<Sample> findByAccession(@Param("accession") String accession, Pageable page);

    Page<Sample> findByAccessionAndGroupsContains(@Param("accession") String accession, @Param("group") String group, Pageable page);

    Page<Sample> findByKeywordsAndGroupsContains(@Param("keyword") String keyword, @Param("group") String group, Pageable page);
}
