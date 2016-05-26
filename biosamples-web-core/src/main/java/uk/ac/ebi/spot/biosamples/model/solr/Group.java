package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import org.json.JSONArray;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQueryDocument;

import org.apache.solr.client.solrj.beans.Field;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
@SolrDocument(solrCoreName = "groups")
public class Group implements ResultQueryDocument {

    private final DateTimeFormatter solrDateFormatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");
    // duplicated fields to disambiguate - no need to return
    @Id String accession;
    @Field String description;

    @Field(value = "updatedate") String updateDate;
    @Field(value = "releasedate") String releaseDate;

    // collection of all characteristics as key/list of value pairs
    @JsonIgnore @Field("*_crt") Map<String, List<String>> characteristicsText;

    // TODO - if this becomes a read/write API, we will also need a JsonDeserializer
    @JsonSerialize(using = CharacteristicMappingsSerializer.class)
    @Field("*_crt_json")
    Map<String, List<String>> characteristics;

    // XML payload for this sample - don't return in REST API
    @Field("xmlAPI") @JsonIgnore String xml;

    // submission metadata
    @Field("submission_acc") String submissionAccession;
    @Field("submission_title") String submissionTitle;

    @Field("number_of_samples") String numberOfSamples;

    @Field("external_references_json") String databases = "[]";

    public String getAccession() {
        return accession;
    }

    public void setAccession(String accession) {
        this.accession = accession;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getUpdateDate() {
        return LocalDate.from(solrDateFormatter.parse(this.updateDate));
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
    }

    public LocalDate getReleaseDate() {
        return LocalDate.from(solrDateFormatter.parse(this.releaseDate));
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
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

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
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

    public String getDocumentType() {
        return "BioSampleGroup";
    }

    public String getNumberOfSamples() {
        return numberOfSamples;
    }

    public void setNumberOfSamples(String numberOfSamples) {
        this.numberOfSamples = numberOfSamples;
    }

    public Map<String, String> getDatabases() {
        JSONArray jsonArray = new JSONArray(databases);
        Map<String, String>  map = new HashMap<>();
        for(int i = 0; i < jsonArray.length(); i++) {
            map.put((String) jsonArray.getJSONObject(i).get("Acc"), (String) jsonArray.getJSONObject(i).get("URL"));
        }
        return map;
    }

    public void setDatabases(String databases) {
        this.databases = databases;
    }
}
