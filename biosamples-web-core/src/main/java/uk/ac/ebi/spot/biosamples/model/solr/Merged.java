package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.solr.client.solrj.beans.Field;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Created by lucacherubin on 2016/04/11.
 */
@org.springframework.data.solr.core.mapping.SolrDocument(solrCoreName = "merged")
public class Merged {

    private final DateTimeFormatter solrDateFormatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss[.SSS]'Z'");
    // duplicated fields to disambiguate - no need to return
    @Id
    @Field String accession;

    @Field(value = "description") String description;

    @Field(value = "updatedate") String updateDate;

    @Field(value = "releasedate") String releaseDate;

    // collection of all characteristics as key/list of value pairs
    @JsonIgnore @Field("*_crt")
    Map<String, List<String>> characteristicsText;

    // TODO - if this becomes a read/write API, we will also need a JsonDeserializer
    @JsonSerialize(using = CharacteristicMappingsSerializer.class)
    @Field("*_crt_json")
    Map<String, List<String>> characteristics;

    // XML payload for this sample - don't return in REST API
    @Field("xmlAPI") @JsonIgnore String xml;

    // submission metadata
    @Field("submission_acc") String submissionAccession;
    @Field("submission_title") String submissionTitle;

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

    public LocalDate getReleaseDate() {
        return LocalDate.from(solrDateFormatter.parse(this.releaseDate));
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public LocalDate getUpdateDate() {
        return LocalDate.from(solrDateFormatter.parse(this.updateDate));
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

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }


}
