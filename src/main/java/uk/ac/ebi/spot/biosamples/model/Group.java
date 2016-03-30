package uk.ac.ebi.spot.biosamples.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.solr.client.solrj.beans.Field;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;
import org.springframework.format.annotation.DateTimeFormat;
import uk.ac.ebi.spot.biosamples.model.mapping.CharacteristicMappingsSerializer;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
@SolrDocument(solrCoreName = "groups")
public class Group {
    // duplicated fields to disambiguate - no need to return
    @Id @Field("group_acc") @JsonIgnore String groupAccession;
    @Field("submission_description") @JsonIgnore String submissionDescription;

    // core fields
    @Field String accession;
    @Field String description;

    @Field("group_update_date") @DateTimeFormat Date updateDate;
    @Field("group_release_date") @DateTimeFormat Date releaseDate;

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
    @Field("submission_update_date") @DateTimeFormat Date submissionUpdateDate;

    public String getGroupAccession() {
        return groupAccession;
    }

    public void setGroupAccession(String groupAccession) {
        this.groupAccession = groupAccession;
    }

    public String getSubmissionDescription() {
        return submissionDescription;
    }

    public void setSubmissionDescription(String submissionDescription) {
        this.submissionDescription = submissionDescription;
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

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public Date getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(Date releaseDate) {
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

    public Date getSubmissionUpdateDate() {
        return submissionUpdateDate;
    }

    public void setSubmissionUpdateDate(Date submissionUpdateDate) {
        this.submissionUpdateDate = submissionUpdateDate;
    }
}
