package uk.ac.ebi.spot.biosamples.model.ne4j;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by tliener on 20/04/2016.
 */
@NodeEntity
public class Submission {

	@GraphId
	private Long id;

	@Property
	private String submissionId;

	@Relationship(type = "OWNERSHIP", direction = Relationship.INCOMING)
	private Set<Sample> samples;

	@Relationship(type = "OWNERSHIP", direction = Relationship.INCOMING)
	private Set<Group> groups;

	public Submission() {
	};

	public Long getId() {
		return id;
	}

	public String getSubmissionId() {
		return submissionId;
	}

	public Set<Sample> getSamples() {
		return samples;
	}

	public Set<Group> getGroups() {
		return groups;
	}
}
