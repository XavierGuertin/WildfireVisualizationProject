package wildfire.visualization.backend.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

class StacConversionExceptionTests {

    @Test
    public void testConstructorWithMessage() {
        StacConversionException exception = new StacConversionException("Error message");
        assertNotNull(exception);
        assertEquals("Error message", exception.getMessage());
    }

    @Test
    public void testConstructorWithMessageAndCause() {
        Throwable cause = new Throwable("Cause message");
        StacConversionException exception = new StacConversionException("Error message", cause);
        assertNotNull(exception);
        assertEquals("Error message", exception.getMessage());
        assertEquals(cause, exception.getCause());
    }
}
