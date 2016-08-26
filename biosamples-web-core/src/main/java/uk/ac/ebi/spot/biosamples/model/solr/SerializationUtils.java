package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class SerializationUtils {



    public static JsonNode organizationSerializer(String fieldContent) throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        ArrayNode newNode = mapper.createArrayNode();
        ArrayNode oldNode = (ArrayNode) mapper.readTree(fieldContent);
        oldNode.forEach(jsonNode -> {
            ObjectNode orgObject = ((ObjectNode) jsonNode).deepCopy();
            orgObject.remove("E-mail");

            newNode.add(orgObject);
        });

        return newNode;
    }

    public static JsonNode genericSerializer(String fieldContent) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.valueToTree(fieldContent);
    }

    static JsonNode characteristicsSerializer(Map<String, List<String>> characteristicMappings) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode object = mapper.createObjectNode();
        for (String crt : characteristicMappings.keySet()) {
            ArrayNode array = mapper.createArrayNode();
            for (String jsonFromSolr : characteristicMappings.get(crt)) {
                // parse json from solr
                JsonNode json = mapper.readTree(jsonFromSolr);
                array.add(json);
            }
            object.set(crt, array);
        }
        return object;
    }
}