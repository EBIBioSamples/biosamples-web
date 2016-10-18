package uk.ac.ebi.spot.biosamples.model.solr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.MissingNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

class SerializationUtils {

    public static JsonNode organizationSerializer(String fieldContent) throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        ArrayNode newNode = mapper.createArrayNode();
        if (fieldContent != null && fieldContent.trim().length() > 0) {
	        ArrayNode oldNode = (ArrayNode) mapper.readTree(fieldContent);
	        oldNode.forEach(jsonNode -> {
	            ObjectNode orgObject = ((ObjectNode) jsonNode).deepCopy();
	            orgObject.remove("E-mail");
	            newNode.add(orgObject);
	        });
            return newNode;
        } else {
            return null;
        }
    }

    public static JsonNode contactSerializer(String fieldContent) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        if (fieldContent == null) {
        	//consider also using nullnode or missingnode instead
        	return null;
        }
        return mapper.readTree(fieldContent);
    }

    public static JsonNode genericSerializer(String fieldContent) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.valueToTree(fieldContent);
    }

    public static JsonNode characteristicsSerializer(Map<String, List<String>> characteristicMappings) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode object = mapper.createObjectNode();
        Set<String> filteredCharacterstics = characteristicMappings.keySet().stream()
                .filter(el->!SolrIgnoredField.SAMPLE.isIgnored(el)).collect(Collectors.toSet());
        for (String crt : filteredCharacterstics) {
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
