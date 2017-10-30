package uk.ac.ebi.spot.biosamples.service;

import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.hateoas.ResourceProcessor;
import org.springframework.stereotype.Component;

import uk.ac.ebi.spot.biosamples.model.neo4j.NeoSample;
import uk.ac.ebi.spot.biosamples.model.solr.SolrIgnoredField;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.repository.neo4j.NeoSampleRepository;
import uk.ac.ebi.spot.biosamples.repository.solr.SolrSampleRepository;

@Component
public class SolrDerivedOrganismResourceProcessor implements ResourceProcessor<Resource<SolrSample>> {


	private final Logger log = LoggerFactory.getLogger(getClass());
	
	@Autowired
	private SolrSampleRepository solrSampleRepository;
	
	@Autowired
	private NeoSampleRepository neoSampleRepository;
	
	private static final String ORGANISM = "organism";
	
	@Override
	public Resource<SolrSample> process(Resource<SolrSample> resource) {
		Map<String, List<String>> resourceCharText = resource.getContent().getCharacteristicsText();
		Map<String, List<String>> resourceCharJson = resource.getContent().getCharacteristics();

		if (resourceCharText.containsKey("organism")) {				
			//sample has organsim, quick exit
			return resource;
		}
		
		Deque<SolrSample> targets = new LinkedList<>();
		targets.add(resource.getContent());
		//while target has no organism and has derived from
		while (!targets.isEmpty()) {
			SolrSample target = targets.pop();

			log.info("looking at target "+target.getAccession()+" for resource "+resource.getContent().getAccession());
			
			Map<String, List<String>> targetCharText = target.getCharacteristicsText();
			Map<String, List<String>> targatCharJson = target.getCharacteristics();
			NeoSample neoTarget = neoSampleRepository.findOneByAccession(target.getAccession());
			
			//if this sample has an organism attribute, then apply it to the resource sample
			if (targetCharText.containsKey(ORGANISM)) {				

				log.info("target has organism "+targetCharText.get(ORGANISM));
				
				//create a new map, copy over old, add new, persist
		        TreeMap<String, List<String>> newCharText = new TreeMap<>();
		        TreeMap<String, List<String>> newCharJson = new TreeMap<>();
		        for (String key : resourceCharText.keySet()) {
		        	newCharText.put(key, resourceCharText.get(key));
		        }
		        for (String key : resourceCharJson.keySet()) {
		        	newCharJson.put(key, resourceCharJson.get(key));
		        }
		        //if there was already something copied over then it may exist
		        if (!newCharText.containsKey(ORGANISM)) {
		        	newCharText.put(ORGANISM, new ArrayList<>());
		        	newCharJson.put(ORGANISM, new ArrayList<>());
		        }
		        //put the targets term here
		        //TODO mark with inherited from if appropriate
		        newCharText.get(ORGANISM).addAll(targetCharText.get(ORGANISM));
		        newCharJson.get(ORGANISM).addAll(targatCharJson.get(ORGANISM));
		        
		        resource.getContent().setCharacteristicsText(newCharText);
		        resourceCharText = newCharText;

		        resource.getContent().setCharacteristics(newCharJson);
		        resourceCharJson = newCharJson;
		        
			} else if (neoTarget.getDerivedFrom().size() > 1) {
				//if the sample doesn't have an organism, but is derived from something
				//then put the something onto the queue to look at later
				for (NeoSample derivedFrom : neoTarget.getDerivedFrom()) {
					targets.add(solrSampleRepository.findOne(derivedFrom.getAccession()));
				}
			} 
		}
		return resource;
	}

}
