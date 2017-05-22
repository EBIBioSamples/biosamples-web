package uk.ac.ebi.spot.biosamples.model.jsonld;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class JsonLDSample {

    @JsonProperty("@context")
    private final String context = "http://schema.org";

    @JsonProperty("@type")
    private final String type = "Sample";

    private String identifier;
    private String name;
    private String description;

    @JsonIgnore
    private String url;

    private List<String> datasetUrl;
    private List<JsonLDPropertyValue> additionalProperties;

    public String getType() { return type; }

    public String getContext() {
        return context;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public List<String> getDatasetUrl() {
        return datasetUrl;
    }

    public void setDatasetUrl(List<String> datasetUrl) {
        this.datasetUrl = datasetUrl;
    }

    public List<JsonLDPropertyValue> getAdditionalProperties() {
        return additionalProperties;
    }

    public void setAdditionalProperties(List<JsonLDPropertyValue> additionalProperties) {
        this.additionalProperties = additionalProperties;
    }
}
