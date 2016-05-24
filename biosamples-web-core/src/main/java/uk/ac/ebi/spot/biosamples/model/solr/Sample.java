package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.commons.collections.list.TreeList;
import org.apache.solr.client.solrj.beans.Field;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;
import uk.ac.ebi.spot.biosamples.model.xml.ResultQueryDocument;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
@SolrDocument(solrCoreName = "samples")
public class Sample implements ResultQueryDocument {
    // duplicated fields to disambiguate - no need to return
    private final DateTimeFormatter solrDateFormatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Id @Field(value = "accession") String accession;

    @Field(value = "description") String description;

    @Field(value = "updatedate")
    String updateDate;
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

    @Field("sample_grp_accessions")
    List<String> groups;

    @Field("external_references_json")
    String databases_json;

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

    public LocalDate getReleaseDate() throws ParseException {
        return LocalDate.from(solrDateFormatter.parse(releaseDate));
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public LocalDate getUpdateDate() throws ParseException {
        return LocalDate.from(solrDateFormatter.parse(updateDate));
    }

    public void setUpdateDate(String updateDate) {
        this.updateDate = updateDate;
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

    public List<String> getGroups() {
        return groups;
    }

    public void setGroups(List<String> groups) {
        this.groups = groups;
    }

    public Map<String, String> getDatabases_json() {
        JSONArray jsonArray = new JSONArray(databases_json);
        Map<String, String>  map = new HashMap<>();
        for(int i = 0; i<jsonArray.length(); i++) {
            map.put((String) jsonArray.getJSONObject(i).get("Acc"), (String) jsonArray.getJSONObject(i).get("URL"));
        }
        return map;
    }

    public void setDatabases_json(String databases_json) {
        this.databases_json = databases_json;
    }

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }

    public String getDocumentType() {
        return "BioSample";
    }
}
