package uk.ac.ebi.spot.biosamples.service;

import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.fasterxml.jackson.databind.util.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import uk.ac.ebi.spot.biosamples.model.jsonld.JsonLDMedicalCode;
import uk.ac.ebi.spot.biosamples.model.jsonld.JsonLDPropertyValue;
import uk.ac.ebi.spot.biosamples.model.jsonld.JsonLDSample;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SolrSampleJsonLDConverter implements Converter<SolrSample, JsonLDSample> {

    private Logger log = LoggerFactory.getLogger(this.getClass());
    private ObjectMapper mapper;

    public SolrSampleJsonLDConverter() {
       this.mapper = new ObjectMapper();
    }

    @Override
    public JsonLDSample convert(SolrSample solrSample) {

        JsonLDSample jsonLd = new JsonLDSample();
        jsonLd.setIdentifier(solrSample.getAccession());
        jsonLd.setName(getSampleName(solrSample));
        jsonLd.setDescription(solrSample.getDescription());
//        jsonLD.put("url", getSampleUrl(solrSample)); // need to be implemented at some point, not available now
        jsonLd.setDatasetUrl(getSampleDatasetUrl(solrSample));

        List<JsonLDPropertyValue> additionalProperties = getAdditionalProperties(solrSample);
        jsonLd.setAdditionalProperties(additionalProperties);
        return jsonLd;
    }

    private List<JsonLDPropertyValue> getAdditionalProperties(SolrSample solrSample) {
        List<JsonLDPropertyValue> additionalFields = new ArrayList<>();
        Map<String, List<String>> additionalProperties = solrSample.getCharacteristics();
        for(Map.Entry<String, List<String>> property: additionalProperties.entrySet()) {
            for(String field: property.getValue()) {
                try {
                    SolrMultivalueField multiValueField = mapper.readValue(field, SolrMultivalueField.class);
                    JsonLDPropertyValue jsonLdProperty = new JsonLDPropertyValue();
                    jsonLdProperty.setPropertyId(property.getKey());
                    jsonLdProperty.setValue(multiValueField.getText());
                    JsonLDMedicalCode jsonLdMedicalCode = getMedicalCode(multiValueField);
                    if (jsonLdMedicalCode != null) {
                        jsonLdProperty.setCode(jsonLdMedicalCode);
                    }
                    additionalFields.add(jsonLdProperty);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

        }
        return additionalFields;

    }

    /**
     * Get a base medical code form an ontology term
     * @param singleField
     * @return
     */
    private JsonLDMedicalCode getMedicalCode(SolrMultivalueField singleField) {
        if(singleField.hasOntologyTerms()) {
            List<String> ontologyTerms = singleField.getOntologyTerms();
            JsonLDMedicalCode medicalCode = new JsonLDMedicalCode();
            medicalCode.setCodeValue(ontologyTerms.get(0));
            //TODO medicalCode.setCodeSystem();
            return medicalCode;
        }
        return null;
    }

    /**
     * Return the list of url for external
     * @param solrSample
     * @return
     */
    private List<String> getSampleDatasetUrl(SolrSample solrSample) {
        List<String> sampleDatasetUrls = new ArrayList<>();
        String externalReferences = solrSample.getExternalReferences();
        if (externalReferences != null && !externalReferences.isEmpty()) {
            try {
                List<Map<String, String>> refersList = Arrays.asList(mapper.readValue(externalReferences, Map[].class));
                for (Map<String, String> obj : refersList) {
                    sampleDatasetUrls.add(obj.getOrDefault("URL", ""));
                }
            } catch (IOException ioe) {
                log.error("An error occurred while reading external references for sample %s", solrSample.getAccession(), ioe);
            }
        }
        return sampleDatasetUrls.stream().filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }


    /**
     * Json deserialization of a multivalue field
     * @param characteristics
     * @return
     */
    private List<Map<String, String>> getMultivalueField(List<String> characteristics) {
        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, String>> multivalueField = new ArrayList<>();
        for (String charact: characteristics) {
            try {
                multivalueField.add(mapper.readValue(charact, Map.class));
            } catch (IOException e) {
                log.error("An error occurred while reading attribute in JSON-LD conversion", e);
            }
        }
        return multivalueField;
    }

    /**
     * Get Sample BioSchema.org name as the synonym, if available, or the name of the sample
     * @param sample
     * @return
     */
    private String getSampleName(SolrSample sample) {
        Map<String, List<String>> charcts = sample.getCharacteristics();
        List<String> synonyms = charcts.getOrDefault("synonym", Arrays.asList(sample.getName()));
        return synonyms.get(0);

    }

    private static class SolrMultivalueField {
        String text;
        List<String> ontologyTerms;

        public SolrMultivalueField() {

        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public List<String> getOntologyTerms() {
            return ontologyTerms;
        }

        public void setOntologyTerms(List<String> ontologyTerms) {
            this.ontologyTerms = ontologyTerms;
        }

        public boolean hasOntologyTerms() {
            return this.ontologyTerms != null && this.ontologyTerms.size() > 0;
        }

    }

    @Override
    public JavaType getInputType(TypeFactory typeFactory) {
        return null;
    }

    @Override
    public JavaType getOutputType(TypeFactory typeFactory) {
        return null;
    }
}
