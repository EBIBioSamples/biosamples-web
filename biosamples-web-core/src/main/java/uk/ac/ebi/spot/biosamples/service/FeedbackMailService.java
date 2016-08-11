package uk.ac.ebi.spot.biosamples.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

@Service
public class FeedbackMailService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Value("${biosamples.feedback.mail.from:#{null}}")
    private String from;
    @Value("${biosamples.feedback.mail.to:#{null}}")
    private String to;
    @Value("${biosamples.feedback.mail.subject:Feedback email}")
    private String feedbackSubject;

    @Autowired(required=false)
    private MailSender mailSender;

    public void sendFeedbackMail(String message, String author) {
    	//check that emailing is configured
        log.info("Trying to send feedback email from "+author+" : "+message);
    	if (from != null && to != null && mailSender != null) {
	        SimpleMailMessage email = new SimpleMailMessage();
	        email.setFrom(this.from);
	        email.setTo(this.to);
	        email.setSubject(this.feedbackSubject);
	        email.setText(String.format("%s sent this feedback comment:\n\n%s",author,message));
	        mailSender.send(email);
    	} else {
    		log.info("Skipping sending email as to/from/mailSender not configured");
    	}
    }
}
