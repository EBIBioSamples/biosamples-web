package uk.ac.ebi.spot.biosamples.repository.solr;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;
import uk.ac.ebi.spot.biosamples.repository.ReadOnlyRepository;

@RepositoryRestResource(path="groups",collectionResourceRel="groups",itemResourceRel="group")
public interface SolrGroupRepository extends ReadOnlyRepository<SolrGroup, String> {
    public Page<SolrGroup> findByAccession(@Param("accession") String accession, Pageable page);

    public Page<SolrGroup> findByKeywords(@Param("keyword") String keyword, Pageable page);


}
