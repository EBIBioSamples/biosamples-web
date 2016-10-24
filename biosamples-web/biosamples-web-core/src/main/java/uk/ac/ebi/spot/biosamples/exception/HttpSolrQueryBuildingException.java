package uk.ac.ebi.spot.biosamples.exception;

/**
 * Javadocs go here!
 *
 * @author Tony Burdett
 * @date 29/04/16
 */
public class HttpSolrQueryBuildingException extends RuntimeException {
    public HttpSolrQueryBuildingException() {
    }

    public HttpSolrQueryBuildingException(String message) {
        super(message);
    }

    public HttpSolrQueryBuildingException(String message, Throwable cause) {
        super(message, cause);
    }

    public HttpSolrQueryBuildingException(Throwable cause) {
        super(cause);
    }

    public HttpSolrQueryBuildingException(String message,
                                          Throwable cause,
                                          boolean enableSuppression,
                                          boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
