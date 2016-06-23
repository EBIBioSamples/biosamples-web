package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;

public class ExternalReferencesSerializer extends JsonSerializer<String> {
    @Override
    public void serialize(String externalReferences,
                          JsonGenerator jsonGenerator,
                          SerializerProvider serializerProvider) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        jsonGenerator.writeObject(mapper.readTree(externalReferences));
    }
}
