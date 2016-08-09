package uk.ac.ebi.spot.biosamples.service.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${mail.host}")
    private String host;
    @Value("${mail.port}")
    private int port;
    @Value("${mail.protocol}")
    private String protocol;


    @Bean
    JavaMailSenderImpl mailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setJavaMailProperties(getMailProperties());
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setProtocol(protocol);
        return mailSender;
    }

    private Properties getMailProperties() {
        Properties props = new Properties();
        //Specifies the default message transport protocol
        props.setProperty("mail.transport.protocol", "smtp");
        props.setProperty("mail.smtp.auth", "false");
        props.setProperty("mail.smtp.starttls.enable", "false");

        //Debug property
        props.setProperty("mail.debug", "false");
        return props;
    }

}
