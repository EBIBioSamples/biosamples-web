package uk.ac.ebi.spot.biosamples.model.neo4j;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.Set;

@NodeEntity(label="ExternalLink")
public class NeoExternalLink {

	@GraphId
	private Long id;

	@Property
	private String url;

	@Relationship(type = "HASLINK", direction = Relationship.INCOMING)
	private Set<NeoSample> samples;

	@Relationship(type = "HASLINK", direction = Relationship.INCOMING)
	private Set<NeoGroup> groups;

	public NeoExternalLink() {
	};

	public Long getId() {
		return id;
	}

	public String getUrl() {
		return url;
	}

	public Set<NeoSample> getSamples() {
		return samples;
	}

	public Set<NeoGroup> getGroups() {
		return groups;
	}

}
