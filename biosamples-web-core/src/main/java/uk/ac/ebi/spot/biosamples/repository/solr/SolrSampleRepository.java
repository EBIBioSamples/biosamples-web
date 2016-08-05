package uk.ac.ebi.spot.biosamples.repository.solr;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
public interface SolrSampleRepository extends ReadOnlySolrRepository<SolrSample, String> {
    Page<SolrSample> findByAccession(@Param("accession") String accession, Pageable page);

    Page<SolrSample> findByKeywords(@Param("keyword") String keyword, Pageable page);

    Page<SolrSample> findByAccessionAndGroupsContains(@Param("accession") String accession, @Param("group") String group, Pageable page);

    Page<SolrSample> findByKeywordsAndGroupsContains(@Param("keyword") String keyword, @Param("group") String group, Pageable page);

    Page<SolrSample> findByGroups(@Param("group") String group, Pageable page);

    SolrSample findFirstByGroupsContains(@Param("group") String group);

}
