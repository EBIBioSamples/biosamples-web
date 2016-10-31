package uk.ac.ebi.spot.biosamples.repository.solr;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.data.solr.repository.Query;

import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.repository.ReadOnlyRepository;

@RepositoryRestResource(path="samples",collectionResourceRel="samples",itemResourceRel="sample")
public interface SolrSampleRepository extends ReadOnlyRepository<SolrSample, String> {
    Page<SolrSample> findByAccession(@Param("accession") String accession, Pageable page);

    @Query(value="?0", requestHandler = "/search")
    Page<SolrSample> findByText(@Param("text") String text, Pageable page);

    @RestResource(path = "findByAccessionAndGroup")
    Page<SolrSample> findByAccessionAndGroups(@Param("accession") String accession, @Param("group") String group, Pageable page);

    @RestResource(path = "findByTextAndGroup")
    @Query(requestHandler = "/search")
    Page<SolrSample> findByTextAndGroups(@Param("text") String text, @Param("group") String group, Pageable page);

    @RestResource(path = "findByGroup")
    Page<SolrSample> findByGroups(@Param("group") String group, Pageable page);

    SolrSample findFirstByGroupsContains(@Param("group") String group);

}
