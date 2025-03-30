package wildfire.visualization.backend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

@ExtendWith(MockitoExtension.class) // Enables Mockito
class DatabaseInitializerTests {

  @Mock
  private JdbcTemplate jdbcTemplate; // Mocked database

  @InjectMocks
  private DatabaseInitializer databaseInitializer; // Class under test

  @BeforeEach
  void setUp() {
    doNothing().when(jdbcTemplate).execute(anyString()); // Mock SQL execution
  }

  @Test
  void testInitializeDatabase() {
    databaseInitializer.initializeDatabase();

    // Verify that SQL was executed
    verify(jdbcTemplate, times(4)).execute(anyString());
  }
}
