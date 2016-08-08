package uk.ac.ebi.spot.biosamples.model.xml;

import org.springframework.data.domain.Page;

import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 03/06/16
 */
public class SampleResultQuery extends ResultQuery<SolrSample> {
    public SampleResultQuery(Page<SolrSample> results) {
        super(results);
    }

    @Override protected String getDocumentType(SolrSample result) {
        return "BioSample";
    }

    @Override protected String getAccession(SolrSample result) {
        return result.getAccession();
    }
}
