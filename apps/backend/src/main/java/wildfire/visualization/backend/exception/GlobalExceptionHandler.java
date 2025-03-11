package wildfire.visualization.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import wildfire.visualization.backend.model.ApiError;

@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ConfigException.class)
    public ResponseEntity<ApiError> handleConfigException(ConfigException ex, WebRequest request) {
        logger.error("Config operation failed", ex);

        ApiError apiError = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Config Error",
                ex.getMessage(),
                request.getDescription(false));

        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGlobalException(Exception ex, WebRequest request) {
        logger.error("Unexpected error occurred", ex);

        ApiError apiError = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Server Error",
                "An unexpected error occurred",
                request.getDescription(false));

        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(DataException.class)
    public ResponseEntity<ApiError> handleDataException(DataException ex, WebRequest request) {
        logger.error("Data operation failed", ex);

        ApiError apiError = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Data Error",
                ex.getMessage(),
                request.getDescription(false));

        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TestException.class)
    public ResponseEntity<ApiError> handleTestException(TestException ex, WebRequest request) {
        logger.error("Test operation failed", ex);

        ApiError apiError = new ApiError(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "Test Error",
                ex.getMessage(),
                request.getDescription(false));

        return new ResponseEntity<>(apiError, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(RepositoryException.class)
    public ResponseEntity<ApiError> handleRepositoryException(RepositoryException ex, WebRequest request) {
        logger.error("Database operation failed", ex);

        ApiError apiError = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Database Error",
                ex.getMessage(),
                request.getDescription(false));

        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}