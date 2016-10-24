package uk.ac.ebi.spot.biosamples.model.xml;

import org.springframework.data.domain.Page;

import uk.ac.ebi.spot.biosamples.model.solr.SolrGroup;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 03/06/16
 */
public class GroupResultQuery extends ResultQuery<SolrGroup> {
    public GroupResultQuery(Page<SolrGroup> results) {
        super(results);
    }

    @Override protected String getDocumentType(SolrGroup result) {
        return "BioSampleGroup";
    }

    @Override protected String getAccession(SolrGroup result) {
        return result.getAccession();
    }
}
