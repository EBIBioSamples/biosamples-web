package uk.ac.ebi.spot.biosamples.model.xml;

import org.springframework.data.domain.Page;
import uk.ac.ebi.spot.biosamples.model.solr.Sample;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 03/06/16
 */
public class SampleResultQuery extends ResultQuery<Sample> {
    public SampleResultQuery(Page<Sample> results) {
        super(results);
    }

    @Override protected String getDocumentType(Sample result) {
        return "BioSample";
    }

    @Override protected String getAccession(Sample result) {
        return result.getAccession();
    }
}
