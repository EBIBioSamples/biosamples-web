package uk.ac.ebi.spot.biosamples.model.ne4j;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Set;

@NodeEntity
public class ExternalLink {

	@GraphId
	private Long id;

	@Property
	private String url;

	@Relationship(type = "HASLINK", direction = Relationship.INCOMING)
	private Set<Sample> samples;

	@Relationship(type = "HASLINK", direction = Relationship.INCOMING)
	private Set<Group> groups;

	public ExternalLink() {
	};

	public Long getId() {
		return id;
	}

	public String getUrl() {
		return url;
	}

	public Set<Sample> getSamples() {
		return samples;
	}

	public Set<Group> getGroups() {
		return groups;
	}

}
