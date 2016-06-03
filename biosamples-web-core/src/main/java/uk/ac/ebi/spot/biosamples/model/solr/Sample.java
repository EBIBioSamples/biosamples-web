package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.solr.client.solrj.beans.Field;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
@SolrDocument(solrCoreName = "samples")
public class Sample {
    private final DateTimeFormatter solrDateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Id @Field("accession") String id;
    @Field String accession;
    @Field String name;
    @Field String description;

    @Field("updatedate") String updateDate;
    @Field("releasedate") String releaseDate;

    // collection of all characteristics as key/list of value pairs
    @JsonIgnore @Field("*_crt") Map<String, List<String>> characteristicsText;

    // TODO - if this becomes a read/write API, we will also need a JsonDeserializer
    @JsonSerialize(using = CharacteristicMappingsSerializer.class)
    @Field("*_crt_json")
    Map<String, List<String>> characteristics;

    // collection of all external reference names
    @JsonIgnore @Field("external_references_name") List<String> externalReferencesNames;

    // external references
    @JsonSerialize(using = ExternalReferencesSerializer.class)
    @Field("external_references_json")
    String externalReferences;

    // group metadata
    @Field("sample_grp_accessions") List<String> groupAccession;

    // submission metadata
    @Field("submission_acc") String submissionAccession;
    @Field("submission_title") String submissionTitle;

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

    public Map<String, List<String>> getCharacteristicsText() {
        // create a sorted, unmodifiable clone of this map (sorted by natural key order)
        TreeMap<String, List<String>> result = new TreeMap<>();
        for (String key : characteristicsText.keySet()) {
            result.put(key.replace("_crt", ""), characteristicsText.get(key));
        }
        return Collections.unmodifiableMap(result);
    }

    public void setCharacteristicsText(Map<String, List<String>> characteristicsText) {
        this.characteristicsText = characteristicsText;
    }

    public Map<String, List<String>> getCharacteristics() {
        // create a sorted, unmodifiable clone of this map (sorted by natural key order)
        TreeMap<String, List<String>> result = new TreeMap<>();
        for (String key : characteristics.keySet()) {
            result.put(key.replace("_crt_json", ""), characteristics.get(key));
        }
        return Collections.unmodifiableMap(result);
    }

    public void setCharacteristics(Map<String, List<String>> characteristics) {
        this.characteristics = characteristics;
    }

    public String getExternalReferences() {
        return externalReferences;
    }

    public void setExternalReferences(String externalReferences) {
        this.externalReferences = externalReferences;
    }

    public List<String> getGroupAccession() {
        return groupAccession;
    }

    public void setGroupAccession(List<String> groupAccession) {
        this.groupAccession = groupAccession;
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
}
