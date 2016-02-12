package uk.ac.ebi.spot.biosamples.repository;

import org.springframework.data.solr.repository.SolrCrudRepository;
import uk.ac.ebi.spot.biosamples.model.Sample;

import java.util.List;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
public interface SampleRepository extends SolrCrudRepository<Sample, String> {
}
