package uk.ac.ebi.spot.biosamples.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.spi.BackendIdConverter;
import org.springframework.stereotype.Component;

import uk.ac.ebi.spot.biosamples.model.ne4j.NeoGroup;
import uk.ac.ebi.spot.biosamples.model.ne4j.NeoSample;
import uk.ac.ebi.spot.biosamples.model.ne4j.NeoSubmission;
import uk.ac.ebi.spot.biosamples.repository.neo4j.NeoGroupRepository;
import uk.ac.ebi.spot.biosamples.repository.neo4j.NeoSampleRepository;
import uk.ac.ebi.spot.biosamples.repository.neo4j.NeoSubmissionRepository;

import java.io.Serializable;


/**
* This class converts (translates) our accession numbers for samples, groups and submission into internal ids and also
* the other way around. By overwriting these two functions Spring allows us to have our accession in the URL of our API to point
* to a certain sample/group/submission instead of having kind of random internal (neo) ids.
* */
@Component
public class NeoBackendIdConverter implements BackendIdConverter {

	@Autowired
	private NeoSampleRepository sampleRepository;

	@Autowired
	private NeoGroupRepository groupRepository;

	@Autowired
	private NeoSubmissionRepository submissionRepository;

	@Override
	public Serializable fromRequestId(String id, Class<?> entityType) {
		if (entityType.equals(NeoSample.class)) {
			NeoSample sample = sampleRepository.findOneByAccession(id);
			if (sample == null) { 
				return -1;
			} else {
				return sample.getId();
			}
		} else if (entityType.equals(NeoGroup.class)) {
			NeoGroup group = groupRepository.findOneByAccession(id);
			if (group == null) {
				return -1;
			} else {
				return group.getId();
			}
		} else if (entityType.equals(NeoSubmission.class)) {
			NeoSubmission submission = submissionRepository.findOneBySubmissionId(id);
			if (submission == null) {
				return -1;
			} else {
				return submission.getId();
			}
		} else {
			throw new IllegalArgumentException("Unrecognized class " + entityType);
		}
	}

	@Override
	public String toRequestId(Serializable id, Class<?> entityType) {
		if (entityType.equals(NeoSample.class)) {
			NeoSample sample = sampleRepository.findOne((Long)id);
			if (sample == null) { 
				return null;
			} else {
				return sample.getAccession();
			}
		} else if (entityType.equals(NeoGroup.class)) {
			NeoGroup group = groupRepository.findOne((Long)id);
			if (group == null) { 
				return null;
			} else {
				return group.getAccession();
			}
		} else if (entityType.equals(NeoSubmission.class)) {
			NeoSubmission submission = submissionRepository.findOne((Long)id);
			if (submission == null) { 
				return null;
			} else {
				return submission.getSubmissionId();
			}
		} else {
			throw new IllegalArgumentException("Unrecognized class " + entityType);
		}

	}
	@Override
	public boolean supports(Class<?> delimiter) {
		if (delimiter.equals(NeoSample.class)) {
			return true;
		} else if (delimiter.equals(NeoGroup.class)) {
			return true;
		} else if (delimiter.equals(NeoSubmission.class)) {
			return true;
		} else {
			return false;
		}
	}

}
