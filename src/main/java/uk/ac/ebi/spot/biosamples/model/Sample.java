package uk.ac.ebi.spot.biosamples.model;

import org.apache.solr.client.solrj.beans.Field;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.SolrDocument;

import java.util.Collection;
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
    //    @Id @Field("id") String id;

    @Field("submission_acc") String submissionAccession;
    @Field("submission_description") String submissionDescription;
    @Field("submission_title") String submissionTitle;
    @Field("submission_update_date") String submissionUpdateDate;

    @Id @Field("sample_acc") String sampleAccession;
    @Field("sample_update_date") String sampleUpdateDate;

    @Field String accession;
    @Field String description;
    @Field("sample_release_date") String sampleReleaseDate;
    @Field("update_date") Collection<String> updateDates;

    @Field("*_crt") Map<String, List<String>> characteristics;

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

    public String getSubmissionUpdateDate() {
        return submissionUpdateDate;
    }

    public void setSubmissionUpdateDate(String submissionUpdateDate) {
        this.submissionUpdateDate = submissionUpdateDate;
    }

    public String getSampleAccession() {
        return sampleAccession;
    }

    public void setSampleAccession(String sampleAccession) {
        this.sampleAccession = sampleAccession;
    }

    public String getSampleUpdateDate() {
        return sampleUpdateDate;
    }

    public void setSampleUpdateDate(String sampleUpdateDate) {
        this.sampleUpdateDate = sampleUpdateDate;
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

    public String getSampleReleaseDate() {
        return sampleReleaseDate;
    }

    public void setSampleReleaseDate(String sampleReleaseDate) {
        this.sampleReleaseDate = sampleReleaseDate;
    }

    public Collection<String> getUpdateDates() {
        return updateDates;
    }

    public void setUpdateDates(Collection<String> updateDates) {
        this.updateDates = updateDates;
    }

    public Map<String, List<String>> getCharacteristics() {
        return characteristics;
    }

    public void setCharacteristics(Map<String, List<String>> characteristics) {
        this.characteristics = characteristics;
    }
}
