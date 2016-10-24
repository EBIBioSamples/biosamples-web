package uk.ac.ebi.spot.biosamples.repository.neo4j;

import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import uk.ac.ebi.spot.biosamples.model.neo4j.NeoExternalLink;

@RepositoryRestResource(path="externallinksrelations",collectionResourceRel="externallinksrelations",itemResourceRel="externallinkrelations")
public interface NeoExternalLinkRepository extends ReadOnlyNeoRepository<NeoExternalLink> {
	
	public NeoExternalLink findOneByUrl(String Url);
	
}