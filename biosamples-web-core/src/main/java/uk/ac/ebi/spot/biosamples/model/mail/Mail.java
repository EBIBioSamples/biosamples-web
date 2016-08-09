package uk.ac.ebi.spot.biosamples.model.mail;

/**
 * Created by lucacherubin on 2016/08/09.
 */
public class FeedbackMail {

    private String to;

    private String from;

    private String link;

    private String subject;

    private String body;

    public FeedbackMail(){

    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public void addToBody(String textToAdd) {
        String newBody = getBody() + textToAdd;
        setBody(newBody);
    }


}
