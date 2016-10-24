package uk.ac.ebi.spot.biosamples.exception;

/**
 * Created by lucacherubin on 2016/07/06.
 */
public class HtmlContentNotFound extends RuntimeException {

    public HtmlContentNotFound() {
        super();
    }

    public HtmlContentNotFound(String message) {
        super(message);
    }

    public HtmlContentNotFound(String message, Throwable cause) {
        super(message, cause);
    }

    public HtmlContentNotFound(Throwable cause) {
        super(cause);
    }

    protected HtmlContentNotFound(String message,
                                  Throwable cause,
                                  boolean enableSuppression,
                                  boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
