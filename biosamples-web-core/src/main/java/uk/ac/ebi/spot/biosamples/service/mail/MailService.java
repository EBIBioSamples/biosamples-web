package uk.ac.ebi.spot.biosamples.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import uk.ac.ebi.spot.biosamples.model.mail.FeedbackMail;
import uk.ac.ebi.spot.biosamples.model.mail.Mail;

@Service
public class FeedbackMailService {

    @Value("${mail.from}")
    private String from;
    @Value("${mail.to}")
    private String to;

    @Value("${mail.feedback.subject}")
    private String feedbackSubject;


    private final Logger log = LoggerFactory.getLogger(getClass());
    protected Logger getLog() { return log; }

    @Autowired
    private JavaMailSender mailSender;


    public void sendFeedbackMail(String message, String author) {
        getLog().info("Sending feedback email");
        FeedbackMail email = new FeedbackMail();
        email.setFrom(this.from);
        email.setTo(this.to);
        email.setSubject(this.feedbackSubject);
        email.addToBody(String.format("%s sent this feedback comment:\n\n",author));
        email.addToBody(message);
        sendEmail(email);
    }

    void sendEmail(Mail email) {

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email.getTo());
        mailMessage.setFrom(email.getFrom());
        mailMessage.setSubject(email.getSubject());
        mailMessage.setText(email.getBody());
        mailSender.send(mailMessage);
        getLog().info("Email sent");
    }

}
