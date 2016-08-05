package uk.ac.ebi.spot.biosamples.repository.neo4j;

import org.springframework.data.neo4j.annotation.Query;

import uk.ac.ebi.spot.biosamples.model.ne4j.NeoSubmission;

public interface NeoSubmissionRepository extends ReadOnlyNeoRepository<NeoSubmission> {

	public NeoSubmission findOneBySubmissionId(String submissionId);

	@Query("MATCH (sub:Submission) WHERE (sub)<-[:OWNERSHIP]-(:Group {accession:{accession}}) RETURN sub")
	public NeoSubmission findSubmissionOwningGroupByAccession(String accession);

	@Query("MATCH (sub:Submission) WHERE (sub)<-[:OWNERSHIP]-(:Sample {accession:{accession}}) RETURN sub")
	public NeoSubmission findSubmissionOwningSampleByAccession(String accession);
	
}