package uk.ac.ebi.spot.biosamples.model.ne4j;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Set;

@NodeEntity
public class Group {

	@GraphId
	private Long id;

	@Property
	private String accession;

	@Relationship(type = "MEMBERSHIP", direction = Relationship.INCOMING)
	private Set<Sample> samples;

	@Relationship(type = "OWNERSHIP", direction = Relationship.OUTGOING)
	private Submission owner;

	@Relationship(type = "HASLINK", direction = Relationship.OUTGOING)
	private Set<ExternalLink> externalLinks;

	public Group() {
	};

	public Long getId() {
		return id;
	}

	public String getAccession() {
		return accession;
	}

	public Submission getOwner() {
		return owner;
	}

	public Set<Sample> getSamples() {
		return samples;
	}
	
	public Set<ExternalLink> getExternalLinks() {
		return externalLinks;
	}

}
