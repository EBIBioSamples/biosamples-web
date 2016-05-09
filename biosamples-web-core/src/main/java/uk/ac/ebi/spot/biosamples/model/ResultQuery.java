package uk.ac.ebi.spot.biosamples.model;

import org.jdom2.*;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.springframework.data.domain.Page;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by lucacherubin on 2016/05/06.
 */
public class ResultQuery {

    private final Namespace XMLNS = Namespace.getNamespace("http://www.ebi.ac.uk/biosamples/ResultQuery1.0");

    private Document doc;

    public ResultQuery(Page<? extends ResultQueryDocument> results) {
        doc = getDocument();
        Element root = getDocumentRoot();
        Element summary = getSummaryInfoElement(results);
        List<Element> resultList = getResultList(results);

        root.addContent(summary);
        root.addContent(resultList);
        doc.setRootElement(root);

    }

    private List<Element> getResultList(Page<? extends ResultQueryDocument> results) throws IllegalArgumentException{

        List<Element> resultList = new ArrayList<>();
        for (ResultQueryDocument result : results) {
            Element rqDocument = new Element(result.getDocumentType(),XMLNS);
            rqDocument.setAttribute("id", result.getAccession());
            resultList.add(rqDocument);
        }
        return resultList;
    }

    private Element getSummaryInfoElement(Page<?> results) {
        Element summary = new Element("SummaryInfo",XMLNS);

        long totalElementsValue = results.getTotalElements();
        int pageNumberValue = results.getNumber();
        int pageSizeValue = results.getSize();
        int resultsFromValue = pageSizeValue * (pageNumberValue - 1) + 1;
        long resultsToValue = Math.min(pageSizeValue * pageNumberValue, totalElementsValue);

        Element total = new Element("Total",XMLNS).setText(Long.toString(totalElementsValue));
        Element from = new Element("From",XMLNS).setText(Integer.toString(resultsFromValue));
        Element to = new Element("To",XMLNS).setText(Long.toString(resultsToValue));
        Element pageNumber = new Element("PageNumber",XMLNS).setText(Integer.toString(pageNumberValue));
        Element pageSize = new Element("PageSize",XMLNS).setText(Integer.toString(pageSizeValue));

        summary.addContent(total);
        summary.addContent(from);
        summary.addContent(to);
        summary.addContent(pageNumber);
        summary.addContent(pageSize);

        return summary;
    }

    private Document getDocument() {

        Document doc = new Document();
        doc.addContent(new Comment("BioSamples XML API - version 1.0"));
        return doc;
    }

    private Element getDocumentRoot() {
        Element root = new Element("ResultQuery", XMLNS);

        Namespace xsi = Namespace.getNamespace("xsi", "http://www.w3.org/2001/XMLSchema-instance");
        root.addNamespaceDeclaration(xsi);

        Attribute schemaLocation = new Attribute(
                "schemaLocation",
                "http://www.ebi.ac.uk/biosamples/SampleGroupExport/1.0 " +
                        "http://www.ebi.ac.uk/biosamples/assets/xsd/v1.0/ResultQuerySampleSchema.xsd",
                xsi);

        root.setAttribute(schemaLocation);
        return root;
    }

    public String renderDocument() {
        XMLOutputter xmlOutput = new XMLOutputter();
        xmlOutput.setFormat(Format.getPrettyFormat());
        return xmlOutput.outputString(doc);
    }


}
