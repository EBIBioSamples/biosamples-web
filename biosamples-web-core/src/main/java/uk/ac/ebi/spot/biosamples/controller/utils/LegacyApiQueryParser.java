package uk.ac.ebi.spot.biosamples.controller.utils;

import java.util.HashMap;
import java.util.Map;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 07/06/16
 */
public class LegacyApiQueryParser {
    public static Map<String,String> parseLegacyQueryFormat(String customQuery) {
        //TODO Check for query param that is not read correctly because is the only one not having a "key"
        String[] paramPairs = customQuery.split("&");
        Map<String,String> customParam = new HashMap<>();
        customParam.put("query","");
        customParam.put("sortby","score");
        customParam.put("sortorder","desc");
        customParam.put("pagesize","25");
        customParam.put("page","0");
        for(String pair: paramPairs) {
            String[] keyValue = pair.split("=");
            if(keyValue.length == 1) {
                customParam.put("query",keyValue[0]);
            } else {
                customParam.put(keyValue[0],keyValue[1]);
            }
        }
        return normalizeParam(customParam);
    }

    private static Map<String,String> normalizeParam(Map<String,String> customParam) {
        if (customParam.get("sortby").matches("relevance")) {
            customParam.put("sortby","score");
        }

        if (customParam.get("sortorder").matches("descending")) {
            customParam.put("sortorder","desc");
        }
        return customParam;
    }
}
