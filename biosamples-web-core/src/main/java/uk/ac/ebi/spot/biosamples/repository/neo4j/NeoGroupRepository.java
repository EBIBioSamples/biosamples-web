package uk.ac.ebi.spot.biosamples.repository.neo4j;


import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import uk.ac.ebi.spot.biosamples.model.neo4j.NeoGroup;


@RepositoryRestResource(path="groupsrelations",collectionResourceRel="groupsrelations",itemResourceRel="grouprelations")
public interface NeoGroupRepository extends ReadOnlyNeoRepository<NeoGroup> {

	public NeoGroup findOneByAccession(String accession);
}