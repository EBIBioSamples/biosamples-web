package uk.ac.ebi.spot.biosamples.exception;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 09/06/16
 */
public class RequestParameterSyntaxException extends RuntimeException {
    public RequestParameterSyntaxException() {
    }

    public RequestParameterSyntaxException(String message) {
        super(message);
    }

    public RequestParameterSyntaxException(String message, Throwable cause) {
        super(message, cause);
    }

    public RequestParameterSyntaxException(Throwable cause) {
        super(cause);
    }

    public RequestParameterSyntaxException(String message,
                                           Throwable cause,
                                           boolean enableSuppression,
                                           boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
