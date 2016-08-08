package uk.ac.ebi.spot.biosamples.exception;

public class APIXMLNotFoundException extends RuntimeException {
    public APIXMLNotFoundException() {
        super();
    }

    public APIXMLNotFoundException(String message) {
        super(message);
    }

    public APIXMLNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public APIXMLNotFoundException(Throwable cause) {
        super(cause);
    }

    protected APIXMLNotFoundException(String message,
                                      Throwable cause,
                                      boolean enableSuppression,
                                      boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
