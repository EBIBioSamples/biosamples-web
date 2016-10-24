package uk.ac.ebi.spot.biosamples.repository.neo4j;

import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import uk.ac.ebi.spot.biosamples.model.neo4j.NeoSample;

@RepositoryRestResource(path="samplesrelations",collectionResourceRel="samplesrelations",itemResourceRel="samplerelations")
public interface NeoSampleRepository extends ReadOnlyNeoRepository<NeoSample> {
	
	public NeoSample findOneByAccession(String accession);
}