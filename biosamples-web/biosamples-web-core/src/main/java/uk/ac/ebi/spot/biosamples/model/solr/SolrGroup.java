package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.solr.client.solrj.beans.Field;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@SolrDocument(solrCoreName = "groups")
public class SolrGroup {
    private final DateTimeFormatter solrDateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Id @Field("accession") String id;
    @Field String accession;
    @Field String name;
    @Field String description;

    @Field("updatedate") String updateDate;
    @Field("releasedate") String releaseDate;

    // collection of all text attributes for search
    @JsonIgnore @Field("text") List<String> keywords;

    // collection of all characteristics as key/list of value pairs
    @JsonIgnore @Field("*_crt") Map<String, List<String>> characteristicsText;

    // TODO - if this becomes a read/write API, we will also need a JsonDeserializer
    @JsonSerialize(using = CharacteristicMappingsSerializer.class)
    @Field("*_crt_json")
    Map<String, List<String>> characteristics;

    // collection of all external reference names
    @JsonIgnore @Field("external_references_name") List<String> externalReferencesNames;

    // external references
    @JsonSerialize(using = JsonGenericSerializer.class)
    @Field("external_references_json")
    String externalReferences;

    // contact
    @JsonSerialize(using = OrganizationSerializer.class)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Field("contact_json")
    String contact;

    // organization informations
    @JsonSerialize(using = OrganizationSerializer.class)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Field("org_json")
    String organization;

    // publication informations
    @JsonSerialize(using = JsonGenericSerializer.class)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Field("pub_json")
    String publications;

    // sample metadata
    @Field("grp_sample_accessions") List<String> samples;

    // submission metadata
    @JsonIgnore
    @Field("submission_acc") 
    private String submissionAccession;
    @JsonIgnore
    @Field("submission_title") 
    private String submissionTitle;

    // XML payload for this sample - don't return in REST API
    @Field("api_xml") @JsonIgnore String xml;

    public String getAccession() {
        return accession;
    }

    public void setAccession(String accession) {
        this.accession = accession;
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

    public LocalDate getUpdateDate() {
        return updateDate == null ? null : LocalDate.from(solrDateFormatter.parse(this.updateDate));
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }

    public LocalDate getReleaseDate() {
        return releaseDate == null ? null : LocalDate.from(solrDateFormatter.parse(this.releaseDate));
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public Map<String, List<String>> getCharacteristicsText() {
        // create a sorted, unmodifiable clone of this map (sorted by natural key order)
        TreeMap<String, List<String>> result = new TreeMap<>();
        if (characteristicsText != null) {
            for (String key : characteristicsText.keySet()) {
                result.put(key.replace("_crt", ""), characteristicsText.get(key));
            }
            return Collections.unmodifiableMap(result);
        }
        else {
            return null;
        }
    }

    public void setCharacteristicsText(Map<String, List<String>> characteristicsText) {
        this.characteristicsText = characteristicsText;
    }

    public Map<String, List<String>> getCharacteristics() {
        // create a sorted, unmodifiable clone of this map (sorted by natural key order)
        TreeMap<String, List<String>> result = new TreeMap<>();
        if (characteristics != null) {
            for (String key : characteristics.keySet()) {
                result.put(key.replace("_crt_json", ""), characteristics.get(key));
            }
            return Collections.unmodifiableMap(result);
        }
        else {
            return null;
        }
    }

    public void setCharacteristics(Map<String, List<String>> characteristics) {
        this.characteristics = characteristics;
    }

    public List<String> getExternalReferencesNames() {
        return externalReferencesNames;
    }

    public void setExternalReferencesNames(List<String> externalReferencesNames) {
        this.externalReferencesNames = externalReferencesNames;
    }

    public String getExternalReferences() {
        return externalReferences;
    }

    public void setExternalReferences(String externalReferences) {
        this.externalReferences = externalReferences;
    }

    public List<String> getSamples() {
        return samples;
    }

    public void setSamples(List<String> samples) {
        this.samples = samples;
    }

    public String getSubmissionAccession() {
        return submissionAccession;
    }

    public void setSubmissionAccession(String submissionAccession) {
        this.submissionAccession = submissionAccession;
    }

    public String getSubmissionTitle() {
        return submissionTitle;
    }

    public void setSubmissionTitle(String submissionTitle) {
        this.submissionTitle = submissionTitle;
    }

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }

    public boolean hasSamples() {
    	if (samples == null) {
    		return false;
    	}else if (samples.size() == 0) {
    		return false;
    	} else {
    		return true;
    	}
    }
    
    public String getOrganization() throws IOException {
        JsonNode node = SerializationUtils.organizationSerializer(this.organization);
        if (node == null) {
            return null;
        } else {
            return node.toString();
        }
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getContact() throws IOException {
        JsonNode node = SerializationUtils.organizationSerializer(this.contact);
        if (node == null) {
            return null;
        } else {
            return node.toString();
        }
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getPublications() {
        return publications;
    }

    public void setPublications(String publications) {
        this.publications = publications;
    }
}
