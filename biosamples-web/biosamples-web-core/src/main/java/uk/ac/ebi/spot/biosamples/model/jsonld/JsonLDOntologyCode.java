package uk.ac.ebi.spot.biosamples.model.jsonld;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"@type", "url"})
public class JsonLDOntologyCode {

//    @JsonProperty("@context")
    @JsonIgnore
    private final String context = "http://schema.org";

    @JsonProperty("@type")
    private final String type = "OntologyCode";

    private String url;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }


}
