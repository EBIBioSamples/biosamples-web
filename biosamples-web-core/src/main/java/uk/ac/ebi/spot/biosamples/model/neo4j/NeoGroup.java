package uk.ac.ebi.spot.biosamples.model.neo4j;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.HashSet;
import java.util.Set;

@NodeEntity(label="Group")
public class NeoGroup {

	@GraphId
	private Long id;

	@Property
	private String accession;

	@Relationship(type = "MEMBERSHIP", direction = Relationship.INCOMING)
	private Set<NeoSample> samples = new HashSet<>();

	@Relationship(type = "HASLINK", direction = Relationship.OUTGOING)
	private Set<NeoExternalLink> externalLinks = new HashSet<>();

	public NeoGroup() {
	};

	public Long getId() {
		return id;
	}

	public String getAccession() {
		return accession;
	}

	public Set<NeoSample> getSamples() {
		return samples;
	}
	
	public Set<NeoExternalLink> getExternalLinks() {
		return externalLinks;
	}

}
