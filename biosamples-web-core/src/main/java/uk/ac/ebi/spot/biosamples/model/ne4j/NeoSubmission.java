package uk.ac.ebi.spot.biosamples.model.ne4j;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Set;

@NodeEntity(label="Submission")
public class NeoSubmission {

	@GraphId
	private Long id;

	@Property
	private String submissionId;

	@Relationship(type = "OWNERSHIP", direction = Relationship.INCOMING)
	private Set<NeoSample> samples;

	@Relationship(type = "OWNERSHIP", direction = Relationship.INCOMING)
	private Set<NeoGroup> groups;

	public NeoSubmission() {
	};

	public Long getId() {
		return id;
	}

	public String getSubmissionId() {
		return submissionId;
	}

	public Set<NeoSample> getSamples() {
		return samples;
	}

	public Set<NeoGroup> getGroups() {
		return groups;
	}
}
