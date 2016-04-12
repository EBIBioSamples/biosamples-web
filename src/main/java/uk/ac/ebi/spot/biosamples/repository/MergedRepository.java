package uk.ac.ebi.spot.biosamples.repository;

import org.springframework.data.solr.repository.SolrCrudRepository;
import uk.ac.ebi.spot.biosamples.model.Merged;

/**
 * Created by lucacherubin on 2016/04/11.
 */
public interface MergedRepository extends SolrCrudRepository<Merged, String> {


}
