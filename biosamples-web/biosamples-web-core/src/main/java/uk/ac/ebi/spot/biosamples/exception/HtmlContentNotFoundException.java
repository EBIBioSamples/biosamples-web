package uk.ac.ebi.spot.biosamples.exception;

/**
 * Created by lucacherubin on 2016/07/06.
 */
public class HtmlContentNotFoundException extends RuntimeException {

    public HtmlContentNotFoundException() {
        super();
    }

    public HtmlContentNotFoundException(String message) {
        super(message);
    }

    public HtmlContentNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public HtmlContentNotFoundException(Throwable cause) {
        super(cause);
    }

    protected HtmlContentNotFoundException(String message,
                                  Throwable cause,
                                  boolean enableSuppression,
                                  boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
