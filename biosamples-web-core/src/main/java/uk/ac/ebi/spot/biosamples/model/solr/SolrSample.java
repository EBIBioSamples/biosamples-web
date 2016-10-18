package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.solr.client.solrj.beans.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;

import java.io.IOException;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@SolrDocument(solrCoreName = "samples")
public class SolrSample {

    private final DateTimeFormatter solrDateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Id @Field("accession") private String id;
    @Field private String accession;
    @Field private String name;
    @Field private String description;

    @Field("updatedate") private String updateDate;
    @Field("releasedate") private String releaseDate;
    
    // collection of all text attributes for search
    @JsonIgnore 
    @Field 
    private List<String> text;

    // collection of all characteristics as key/list of value pairs
    @JsonIgnore 
    @Field("*_crt") 
    private Map<String, List<String>> characteristicsText;

    // TODO - if this becomes a read/write API, we will also need a JsonDeserializer
    @JsonSerialize(using = CharacteristicMappingsSerializer.class)
    @Field("*_crt_json")
    private Map<String, List<String>> characteristics;

    // collection of all external reference names
    @JsonIgnore 
    @Field("external_references_name") 
    private List<String> externalReferencesNames;

    // contact informations
    @JsonSerialize(using = OrganizationSerializer.class)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Field("contact_json")
    private String contact;

    // organization informations
    @JsonSerialize(using = OrganizationSerializer.class)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Field("org_json")
    private String organization;


    // publication informations
    @JsonSerialize(using = OrganizationSerializer.class)
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Field("pub_json")
    private String publications;

    // external references
    //@JsonSerialize(using = JsonGenericSerializer.class)
    //@JsonInclude(JsonInclude.Include.NON_EMPTY)
    @Field("external_references_json")
    //don't output in json, will get via _links via relations
    @JsonIgnore
    private String externalReferences;

    // group metadata
    //don't output in json, will get via _links via relations
    @JsonIgnore
    @Field("sample_grp_accessions") 
    private List<String> groups;

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

    public LocalDate getUpdateDate() throws ParseException {
        return updateDate == null ? null : LocalDate.from(solrDateFormatter.parse(updateDate));
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }

    public LocalDate getReleaseDate() throws ParseException {
        return releaseDate == null ? null : LocalDate.from(solrDateFormatter.parse(releaseDate));
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public List<String> getText() {
        return text;
    }

    public void setText(List<String> text) {
        this.text = text;
    }

    /**
     *  return the value string for all characteristics
     * 
     */
    public Map<String, List<String>> getCharacteristicsText() {
        // create a sorted, unmodifiable clone of this map (sorted by natural key order)
        TreeMap<String, List<String>> result = new TreeMap<>();
        Set<String> filteredCharacterstics = characteristics.keySet().stream()
                .filter(el -> !SolrIgnoredField.SAMPLE.isIgnored(el)).collect(Collectors.toSet());
        for (String key : filteredCharacterstics ) {
            result.put(key.replace("_crt", ""), characteristicsText.get(key));
        }
        return Collections.unmodifiableMap(result);
    }

    public void setCharacteristicsText(Map<String, List<String>> characteristicsText) {
        this.characteristicsText = characteristicsText;
    }

    /**
     * return the JSON for all characteristics
     */
    public Map<String, List<String>> getCharacteristics() {
        // create a sorted, unmodifiable clone of this map (sorted by natural key order)
        TreeMap<String, List<String>> result = new TreeMap<>();
        Set<String> filteredCharacterstics = characteristics.keySet().stream()
                .filter(el -> !SolrIgnoredField.SAMPLE.isIgnored(el)).collect(Collectors.toSet());
        for (String key : filteredCharacterstics ) {
            result.put(key.replace("_crt_json", ""), characteristics.get(key));
        }
        return Collections.unmodifiableMap(result);
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

    public List<String> getGroups() {
        return groups;
    }

    public void setGroups(List<String> groups) {
        this.groups = groups;
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
