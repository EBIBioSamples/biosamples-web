package uk.ac.ebi.spot.biosamples.model.solr;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public enum SolrIgnoredField {
    SAMPLE(
        "derivedFrom_crt",
        "derivedFrom_crt_json",
        "derivedTo_crt",
        "derivedTo_crt_json",
        "sameAs_crt",
        "sameAs_crt_json",
        "childOf_crt",
        "childOf_crt_json",
        "parentOf_crt",
        "parentOf_crt_json",
        "recuratedInto_crt",
        "recuratedInto_crt_json",
        "recuratedFrom_crt",
        "recuratedFrom_crt_json"
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
