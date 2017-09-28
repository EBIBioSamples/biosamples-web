package uk.ac.ebi.spot.biosamples.model.jsonld;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"@type", "name", "value", "identifier"})
public class JsonLDPropertyValue {

    @JsonIgnore
    private final String context = "http://schema.org";

    @JsonProperty("@type")
    private final String type = "PropertyValue";

    private String name;
    private String value;

//    @JsonInclude(JsonInclude.Include.NON_NULL)
//    private String identifier;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private JsonLDOntologyCode code;

    public String getType() {
        return type;
    }

    public String getContext() {
        return context;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public JsonLDOntologyCode getCode() {
        return code;
    }

    public void setCode(JsonLDOntologyCode code) {
        this.code = code;
    }

}
