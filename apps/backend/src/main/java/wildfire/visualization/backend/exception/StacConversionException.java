package wildfire.visualization.backend.exception;

public class StacConversionException extends RuntimeException {
    public StacConversionException(String message) {
        super(message);
    }

    public StacConversionException(String message, Throwable cause) {
        super(message, cause);
    }
}
