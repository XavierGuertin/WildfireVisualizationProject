package wildfire.visualization.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import wildfire.visualization.backend.exception.TestException;

/**
 * Controller for testing various system components.
 */
@RestController
@RequestMapping("/api/test")
public class TestController {
  private static final Logger logger = LoggerFactory.getLogger(TestController.class);

  private final JdbcTemplate jdbcTemplate;

  public TestController(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  /**
   * Tests the connection to the database.
   * 
   * @return A response entity containing a success message or an error message.
   * @throws TestException if the database connection fails.
   */
  @GetMapping("/db")
  public ResponseEntity<String> testDbConnection() {
    logger.info("Testing database connection");

    try {
      Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
      logger.debug("Database test query successful with result: {}", result);
      return ResponseEntity.ok("Database connected! Test query result: " + result);
    } catch (Exception e) {
      logger.error("Database connection test failed: {}", e.getMessage(), e);
      throw new TestException("Database connection failed", e);
    }
  }
}
