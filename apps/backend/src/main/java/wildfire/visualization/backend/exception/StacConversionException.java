package wildfire.visualization.backend.exception;

/**
 * Exception class that is thrown when an error occurs during a StacConversion method
 */
public class StacConversionException extends RuntimeException {
    public StacConversionException(String message) {
        super(message);
    }

    public StacConversionException(String message, Throwable cause) {
        super(message, cause);
    }
}
