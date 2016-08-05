package uk.ac.ebi.spot.biosamples.model.ne4j;

import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;

import java.util.Set;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.Relationship;

@NodeEntity
public class Sample {

	@GraphId
	private Long id;

	@Property
	private String accession;

	/* Same as is the only unidirected relationship of the project */
	@Relationship(type = "SAMEAS", direction = Relationship.UNDIRECTED)
	private Set<Sample> sameAs;

	@Relationship(type = "DERIVATION", direction = Relationship.OUTGOING)
	private Set<Sample> derivedTo;

	@Relationship(type = "DERIVATION", direction = Relationship.INCOMING)
	private Set<Sample> derivedFrom;

	@Relationship(type = "RECURATION", direction = Relationship.OUTGOING)
	private Set<Sample> recuratedTo;

	@Relationship(type = "RECURATION", direction = Relationship.INCOMING)
	private Set<Sample> recuratedFrom;

	@Relationship(type = "CHILDOF", direction = Relationship.OUTGOING)
	private Set<Sample> childOf;

	@Relationship(type = "CHILDOF", direction = Relationship.INCOMING)
	private Set<Sample> parentOf;

	/* Outgoing relationships */
	@Relationship(type = "MEMBERSHIP", direction = Relationship.OUTGOING)
	private Set<Group> groups;

	@Relationship(type = "OWNERSHIP", direction = Relationship.OUTGOING)
	private Submission owner;

	@Relationship(type = "HASLINK", direction = Relationship.OUTGOING)
	private Set<ExternalLink> externalLinks;

	private Sample() {
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

	public Set<Group> getGroups() {
		return groups;
	}
	
	public Set<ExternalLink> getExternalLinks() {
		return externalLinks;
	}

	public Set<Sample> getDerivedFrom() {
		return derivedFrom;
	}
	public Set<Sample> getDerivedTo() {
		return derivedTo;
	}

	public Set<Sample> getSameAs() {
		return sameAs;
	}

	public Set<Sample> getParentOf() {
		return parentOf;
	}
	public Set<Sample> getChildOf() {
		return childOf;
	}

	public Set<Sample> getRecuratedTo() {
		return recuratedTo;
	}
	public Set<Sample> getRecuratedFrom() {
		return recuratedFrom;
	}

}
