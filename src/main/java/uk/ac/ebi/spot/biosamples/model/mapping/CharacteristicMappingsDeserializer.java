package uk.ac.ebi.spot.biosamples.model.mapping;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 11/03/16
 */
public class CharacteristicMappingsDeserializer extends JsonDeserializer<Map<String, List<String>>> {
    @Override
    public Map<String, List<String>> deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException {
        
        return null;
    }
}
