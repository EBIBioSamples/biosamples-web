package uk.ac.ebi.spot.biosamples.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import uk.ac.ebi.spot.biosamples.model.sitemap.XmlSitemap;
import uk.ac.ebi.spot.biosamples.model.sitemap.XmlSitemapIndex;
import uk.ac.ebi.spot.biosamples.model.sitemap.XmlUrl;
import uk.ac.ebi.spot.biosamples.model.sitemap.XmlUrlSet;
import uk.ac.ebi.spot.biosamples.model.solr.SolrSample;
import uk.ac.ebi.spot.biosamples.repository.solr.SolrSampleRepository;

import javax.servlet.http.HttpServletRequest;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.text.ParseException;

import static uk.ac.ebi.spot.biosamples.model.sitemap.XmlUrl.XmlUrlBuilder;

@Controller
public class SitemapController {

    private Logger log = LoggerFactory.getLogger(this.getClass());

    @Value("${sitemap.page.size:10000}")
    private int sitemapPageSize;

    private SolrSampleRepository solrSampleRepository;

    SitemapController(SolrSampleRepository sampleRepository) {
        this.solrSampleRepository = sampleRepository;
    }

    @RequestMapping(value = "/sitemap", method = RequestMethod.GET, produces = MediaType.APPLICATION_XML_VALUE)
    @ResponseBody
    public String createSampleSitemapIndex(HttpServletRequest request) throws MalformedURLException {

        long sampleCount = solrSampleRepository.count();
        long pageNumber = Math.floorDiv(sampleCount, sitemapPageSize);
        XmlSitemapIndex xmlSitemapIndex = new XmlSitemapIndex();
        String requestUrl = request.getRequestURL().toString().replaceFirst(request.getRequestURI(), "");
        for (int i=0; i< pageNumber; i++) {
            String location = generateBaseUrl(request) + String.format("/sitemap/%d", i+1);
            XmlSitemap xmlSitemap = new XmlSitemap(location);
            xmlSitemapIndex.addSitemap(xmlSitemap);
        }
        return getSitemapFile(xmlSitemapIndex);
    }


    @RequestMapping(value = "/sitemap/{id}", method = RequestMethod.GET, produces = MediaType.APPLICATION_XML_VALUE)
    @ResponseBody
    public String createSampleSitemapPage(@PathVariable("id") int pageNumber, HttpServletRequest request) throws ParseException {
        final long startTime = System.currentTimeMillis();
        Pageable pageRequest = new PageRequest(pageNumber - 1, sitemapPageSize);
        Page<SolrSample> samplePage = solrSampleRepository.findAll(pageRequest);
        XmlUrlSet xmlUrlSet = new XmlUrlSet();
        for(SolrSample sample: samplePage.getContent()) {
            String location = generateBaseUrl(request) + String.format("/samples/%s", sample.getAccession());
            XmlUrl url = new XmlUrlBuilder(location).lastModified(sample.getUpdateDate()).hasPriority(XmlUrl.Priority.MEDIUM).build();
            xmlUrlSet.addUrl(url);
        }
        log.info(String.format("Returning sitemap for %d samples took %d millis", sitemapPageSize, System.currentTimeMillis() - startTime));
        return getSitemapFile(xmlUrlSet);
    }

    private String getSitemapFile(Object xmlObject) {

        StringWriter writer = new StringWriter(2048);

        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(xmlObject.getClass());
            Marshaller jaxbMarshaller = jaxbContext.createMarshaller();

            jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            jaxbMarshaller.setProperty(Marshaller.JAXB_FRAGMENT, Boolean.TRUE);

            // Set the XML root tag to not include that standalone="yes" attribute
            // Why U no work, JAXB? :O//
            //jaxbMarshaller.setProperty("com.sun.xml.bind.xmlHeaders", "<?xml version=\"1.0\" encoding=\"UTF-8\"?>");

            jaxbMarshaller.marshal(xmlObject, writer);

        } catch (JAXBException e) {
            e.printStackTrace();
        }

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + writer.toString();

    }

    private String generateBaseUrl(HttpServletRequest request) {
//        String mappedHostname = (String) request.getAttribute("mappedHostName");
//        String baseUrl = (String) request.getAttribute("baseUrl");
//        String baseUrlString = mappedHostname + baseUrl;
//        if (baseUrlString.matches("(^null.*|.*null$)")) {
//            baseUrlString = String.format("http://%s:%d", request.getLocalName(), request.getLocalPort());
//        }
//
//        // Ensure the protocol is included on the URL
//        if (! baseUrlString.startsWith("http")) {
//            baseUrlString = "http:" + baseUrlString;
//        }
//        if (!request.getContextPath().isEmpty()) {
//            baseUrlString = baseUrlString + request.getContextPath();
//        }
        String requestURI = request.getRequestURI();
        String requestURL = request.getRequestURL().toString();
        return requestURL.replaceFirst(requestURI, "") +
                request.getContextPath();

    }
}
