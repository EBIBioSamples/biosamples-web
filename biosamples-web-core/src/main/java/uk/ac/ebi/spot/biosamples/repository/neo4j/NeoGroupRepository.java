package uk.ac.ebi.spot.biosamples.repository.neo4j;


import org.springframework.data.neo4j.annotation.Query;

import uk.ac.ebi.spot.biosamples.model.ne4j.NeoGroup;


public interface NeoGroupRepository extends ReadOnlyNeoRepository<NeoGroup> {

	public NeoGroup findOneByAccession(String accession);

	@Query("MATCH (group:Group) WHERE (group)-[:OWNERSHIP]->(:Submission {submissionId:{submissionId}}) RETURN group")
	public Iterable<NeoGroup> findGroupsOwnedBySubmissionBySubmissionId(String submissionId);
	

}