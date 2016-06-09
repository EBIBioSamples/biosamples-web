package uk.ac.ebi.spot.biosamples.model.xml;

import org.jdom2.*;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;
import org.springframework.data.domain.Page;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by lucacherubin on 2016/05/06.
 */
public abstract class ResultQuery<T> {

    private final Namespace XMLNS = Namespace.getNamespace("http://www.ebi.ac.uk/biosamples/ResultQuery1.0");

    private Document doc;

    public ResultQuery(Page<T> results) {
        doc = getDocument();
        Element root = getDocumentRoot();
        Element summary = getSummaryInfoElement(results);
        List<Element> resultList = getResultList(results);

        root.addContent(summary);
        root.addContent(resultList);
        doc.setRootElement(root);
    }

    private List<Element> getResultList(Page<T> results) throws IllegalArgumentException{

        List<Element> resultList = new ArrayList<>();
        for (T result : results) {
            Element rqDocument = new Element(getDocumentType(result),XMLNS);
            rqDocument.setAttribute("id", getAccession(result));
            resultList.add(rqDocument);
        }
        return resultList;
    }

    private Element getSummaryInfoElement(Page<?> results) {
        Element summary = new Element("SummaryInfo",XMLNS);

        long totalElementsValue = results.getTotalElements();
        int pageNumberValue = results.getNumber();
        int pageSizeValue = results.getSize();
        int resultsFromValue = pageSizeValue * pageNumberValue + 1;
        int pageEndValue = (pageNumberValue + 1) * pageSizeValue;
        long resultsToValue = totalElementsValue < pageEndValue ? totalElementsValue : pageEndValue;

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

    protected abstract String getDocumentType(T result);

    protected abstract String getAccession(T result);
}
