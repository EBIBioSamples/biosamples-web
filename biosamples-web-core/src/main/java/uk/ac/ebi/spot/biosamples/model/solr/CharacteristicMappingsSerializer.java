package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 11/03/16
 */
public class CharacteristicMappingsSerializer extends JsonSerializer<Map<String, List<String>>> {
    @Override
    public void serialize(Map<String, List<String>> characteristicMappings,
                          JsonGenerator jsonGenerator,
                          SerializerProvider serializerProvider) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode object = mapper.createObjectNode();
        for (String crt : characteristicMappings.keySet()) {
            for (String jsonFromSolr : characteristicMappings.get(crt)) {
                // parse json from solr
                JsonNode json = mapper.readTree(jsonFromSolr);
                object.set(crt, json);
            }
        }
        jsonGenerator.writeObject(object);
    }
}
