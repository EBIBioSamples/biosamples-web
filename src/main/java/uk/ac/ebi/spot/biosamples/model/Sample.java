package uk.ac.ebi.spot.biosamples.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.solr.client.solrj.beans.Field;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 10/02/16
 */
@SolrDocument
public class Sample {
    // duplicated fields to disambiguate - no need to return
    @Id @Field("sample_acc") @JsonIgnore String sampleAccession;
    @Field("submission_description") @JsonIgnore String submissionDescription;

    // core fields
    @Field String accession;
    @Field String description;

    @Field("sample_update_date") @DateTimeFormat Date updateDate;
    @Field("sample_release_date") @DateTimeFormat Date releaseDate;

    // collection of all characteristics as key/list of value pairs
    @Field("*_crt") Map<String, String> characteristics;
    @Field("*_crt_json") Map<String, String> characteristicMappings;

    // XML payload for this sample - don't return in REST API
    @Field("xmlAPI") @JsonIgnore String xml;

    // submission metadata
    @Field("submission_acc") String submissionAccession;
    @Field("submission_title") String submissionTitle;
    @Field("submission_update_date") @DateTimeFormat Date submissionUpdateDate;

    public String getSubmissionAccession() {
        return submissionAccession;
    }

    public void setSubmissionAccession(String submissionAccession) {
        this.submissionAccession = submissionAccession;
    }

    public String getSubmissionDescription() {
        return submissionDescription;
    }

    public void setSubmissionDescription(String submissionDescription) {
        this.submissionDescription = submissionDescription;
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

    public String getSampleAccession() {
        return sampleAccession;
    }

    public void setSampleAccession(String sampleAccession) {
        this.sampleAccession = sampleAccession;
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

    public Date getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(Date releaseDate) {
        this.releaseDate = releaseDate;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public Map<String, String> getCharacteristics() {
        Map<String, String> result = new HashMap<>(characteristics.size());
        for (String key : characteristics.keySet()) {
            result.put(key.replace("_crt", ""), characteristics.get(key));
        }
        return Collections.unmodifiableMap(result);
    }

    public void setCharacteristics(Map<String, String> characteristics) {
        this.characteristics = characteristics;
    }

    public Map<String, String> getCharacteristicMappings() {
        Map<String, String> result = new HashMap<>(characteristicMappings.size());
        for (String key : characteristicMappings.keySet()) {
            result.put(key.replace("_crt_json", ""), characteristicMappings.get(key));
        }
        return Collections.unmodifiableMap(result);
    }

    public void setCharacteristicMappings(Map<String, String> characteristicMappings) {
        this.characteristicMappings = characteristicMappings;
    }

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }
}
