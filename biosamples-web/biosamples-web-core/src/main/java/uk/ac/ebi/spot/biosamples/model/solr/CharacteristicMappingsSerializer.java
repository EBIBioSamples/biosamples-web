package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
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
        jsonGenerator.writeObject(SerializationUtils.characteristicsSerializer(characteristicMappings));
    }
}
