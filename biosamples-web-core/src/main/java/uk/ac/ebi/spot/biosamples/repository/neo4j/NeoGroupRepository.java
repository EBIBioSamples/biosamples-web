package uk.ac.ebi.spot.biosamples.repository.neo4j;


import org.springframework.data.neo4j.annotation.Query;

import uk.ac.ebi.spot.biosamples.model.ne4j.Group;


public interface NeoGroupRepository extends ReadOnlyNeoRepository<Group> {

	public Group findOneByAccession(String accession);

	@Query("MATCH (group:Group) WHERE (group)-[:OWNERSHIP]->(:Submission {submissionId:{submissionId}}) RETURN group")
	public Iterable<Group> findGroupsOwnedBySubmissionBySubmissionId(String submissionId);
	

}