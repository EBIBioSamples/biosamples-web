package uk.ac.ebi.spot.biosamples.repository.neo4j;

import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.repository.query.Param;

import uk.ac.ebi.spot.biosamples.model.ne4j.NeoSample;

public interface NeoSampleRepository extends ReadOnlyNeoRepository<NeoSample> {
	
	public NeoSample findOneByAccession(String accession);

	@Query("MATCH (sample:Sample) WHERE (sample)-[:OWNERSHIP]->(:Submission {submissionId:{submissionId}}) RETURN sample")
	public Iterable<NeoSample> findSamplesOwnedBySubmissionBySubmissionId(@Param("submissionId") String submissionId);
	
}