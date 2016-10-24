package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;

public class OrganizationSerializer extends JsonSerializer<String> {

    @Override
    public void serialize(String fieldContent,
                          JsonGenerator jsonGenerator,
                          SerializerProvider serializerProvider) throws IOException {
        jsonGenerator.writeObject(SerializationUtils.organizationSerializer(fieldContent));
    }


}
