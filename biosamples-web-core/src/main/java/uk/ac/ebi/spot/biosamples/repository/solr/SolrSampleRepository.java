package uk.ac.ebi.spot.biosamples.repository.solr;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import org.springframework.data.rest.core.annotation.RestResource;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.repository.ReadOnlyRepository;

@RepositoryRestResource(path="samples",collectionResourceRel="samples",itemResourceRel="sample")
public interface SolrSampleRepository extends ReadOnlyRepository<SolrSample, String> {
    Page<SolrSample> findByAccession(@Param("accession") String accession, Pageable page);

    Page<SolrSample> findByKeywords(@Param("keyword") String keyword, Pageable page);

    Page<SolrSample> findByAccessionAndGroupsContains(@Param("accession") String accession, @Param("group") String group, Pageable page);

    @RestResource(path = "groupsamples")
    Page<SolrSample> findByKeywordsAndGroupsContains(@Param(value = "keyword") String keyword, @Param("group") String group, Pageable page);

    Page<SolrSample> findByGroups(@Param("group") String group, Pageable page);

    SolrSample findFirstByGroupsContains(@Param("group") String group);

}
