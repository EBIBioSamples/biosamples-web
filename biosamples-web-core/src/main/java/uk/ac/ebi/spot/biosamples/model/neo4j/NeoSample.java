package uk.ac.ebi.spot.biosamples.model.neo4j;

import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;

import java.util.Set;

import org.neo4j.ogm.annotation.GraphId;
import org.neo4j.ogm.annotation.Relationship;

@NodeEntity(label="Sample")
public class NeoSample {

	@GraphId
	private Long id;

	@Property
	private String accession;

	/* Same as is the only unidirected relationship of the project */
	@Relationship(type = "SAMEAS", direction = Relationship.UNDIRECTED)
	private Set<NeoSample> sameAs;

	@Relationship(type = "DERIVATION", direction = Relationship.OUTGOING)
	private Set<NeoSample> derivedTo;

	@Relationship(type = "DERIVATION", direction = Relationship.INCOMING)
	private Set<NeoSample> derivedFrom;

	@Relationship(type = "RECURATION", direction = Relationship.OUTGOING)
	private Set<NeoSample> recuratedTo;

	@Relationship(type = "RECURATION", direction = Relationship.INCOMING)
	private Set<NeoSample> recuratedFrom;

	@Relationship(type = "CHILDOF", direction = Relationship.OUTGOING)
	private Set<NeoSample> childOf;

	@Relationship(type = "CHILDOF", direction = Relationship.INCOMING)
	private Set<NeoSample> parentOf;

	/* Outgoing relationships */
	@Relationship(type = "MEMBERSHIP", direction = Relationship.OUTGOING)
	private Set<NeoGroup> groups;
	
	@Relationship(type = "HASLINK", direction = Relationship.OUTGOING)
	private Set<NeoExternalLink> externalLinks;

	private NeoSample() {
	};

	public Long getId() {
		return id;
	}

	public String getAccession() {
		return accession;
	}

	public Set<NeoGroup> getGroups() {
		return groups;
	}
	
	public Set<NeoExternalLink> getExternalLinks() {
		return externalLinks;
	}

	public Set<NeoSample> getDerivedFrom() {
		return derivedFrom;
	}
	public Set<NeoSample> getDerivedTo() {
		return derivedTo;
	}

	public Set<NeoSample> getSameAs() {
		return sameAs;
	}

	public Set<NeoSample> getParentOf() {
		return parentOf;
	}
	public Set<NeoSample> getChildOf() {
		return childOf;
	}

	public Set<NeoSample> getRecuratedTo() {
		return recuratedTo;
	}
	public Set<NeoSample> getRecuratedFrom() {
		return recuratedFrom;
	}

}
