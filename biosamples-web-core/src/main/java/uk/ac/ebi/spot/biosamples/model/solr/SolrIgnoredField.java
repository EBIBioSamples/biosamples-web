package uk.ac.ebi.spot.biosamples.model.solr;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public enum SolrIgnoredField {
    SAMPLE(
        "DerivedFrom_crt","DerivedFrom_crt_json"
    ),

    GROUP();

    private List<String> ignoredFields;

    SolrIgnoredField(String... fieldNames) {
        ignoredFields = new ArrayList<>();
        Collections.addAll(ignoredFields, fieldNames);
    }

    public List<String> getIgnoredFields() {
        List<String> outList = new ArrayList<>();
        outList.addAll(ignoredFields);
        return outList;
    }

    public boolean isIgnored(String fieldName) {
        return ignoredFields.contains(fieldName);
    }


}
