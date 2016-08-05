package uk.ac.ebi.spot.biosamples.repository.neo4j;

import uk.ac.ebi.spot.biosamples.model.ne4j.ExternalLink;

public interface NeoExternalLinkRepository extends ReadOnlyNeoRepository<ExternalLink> {
	
	public ExternalLink findOneByUrl(String Url);
	
}