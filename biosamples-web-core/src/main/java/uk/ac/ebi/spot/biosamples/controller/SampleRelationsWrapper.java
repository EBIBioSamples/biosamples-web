package uk.ac.ebi.spot.biosamples.controller;

import java.util.ArrayList;
import java.util.List;

public class SampleRelationsWrapper {    	
	public List<String> derivedFrom = new ArrayList<>();
	public List<String> derivedTo = new ArrayList<>();
	public List<String> childOf = new ArrayList<>();
	public List<String> parentOf = new ArrayList<>();
	public List<String> recuratedInto = new ArrayList<>();
	public List<String> recuratedFrom = new ArrayList<>();
	public List<String> sameAs = new ArrayList<>();
	
	public SampleRelationsWrapper(){}

	public List<String> getDerivedFrom() {
		return derivedFrom;
	}

	public void setDerivedFrom(List<String> derivedFrom) {
		this.derivedFrom = derivedFrom;
	}

	public List<String> getDerivedTo() {
		return derivedTo;
	}

	public void setDerivedTo(List<String> derivedTo) {
		this.derivedTo = derivedTo;
	}

	public List<String> getChildOf() {
		return childOf;
	}

	public void setChildOf(List<String> childOf) {
		this.childOf = childOf;
	}

	public List<String> getParentOf() {
		return parentOf;
	}

	public void setParentOf(List<String> parentOf) {
		this.parentOf = parentOf;
	}

	public List<String> getRecuratedInto() {
		return recuratedInto;
	}

	public void setRecuratedInto(List<String> recuratedInto) {
		this.recuratedInto = recuratedInto;
	}

	public List<String> getRecuratedFrom() {
		return recuratedFrom;
	}

	public void setRecuratedFrom(List<String> recuratedFrom) {
		this.recuratedFrom = recuratedFrom;
	}

	public List<String> getSameAs() {
		return sameAs;
	}

	public void setSameAs(List<String> sameAs) {
		this.sameAs = sameAs;
	};
}