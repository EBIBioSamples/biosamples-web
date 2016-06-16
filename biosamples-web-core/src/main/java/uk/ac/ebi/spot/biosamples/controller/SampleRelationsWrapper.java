package uk.ac.ebi.spot.biosamples.controller;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

public class SampleRelationsWrapper {

    private List<String> derivedFrom = new ArrayList<>();
    private List<String> derivedTo = new ArrayList<>();
    private List<String> childOf = new ArrayList<>();
    private List<String> parentOf = new ArrayList<>();
    private List<String> recuratedInto = new ArrayList<>();
    private List<String> recuratedFrom = new ArrayList<>();
    private List<String> sameAs = new ArrayList<>();
	
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
	}

	public Boolean hasRelations() {
		Boolean hasRelations = false;
		Field[] allFields = this.getClass().getDeclaredFields();
		for (Field field: allFields) {
				try {
					field.setAccessible(true);
					hasRelations = ((List) field.get(this)).size() > 0;
					if (hasRelations) return true;
				} catch (IllegalAccessException e) {
					e.printStackTrace();
				}
		}

		return hasRelations;
	}
}