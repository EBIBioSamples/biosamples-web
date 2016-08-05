package uk.ac.ebi.spot.biosamples.repository.neo4j;

import uk.ac.ebi.spot.biosamples.model.ne4j.NeoExternalLink;

public interface NeoExternalLinkRepository extends ReadOnlyNeoRepository<NeoExternalLink> {
	
	public NeoExternalLink findOneByUrl(String Url);
	
}