package com.example.backend.controller;

//import necessary dependencies
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/test")
public class TestController {
  private static final Logger logger = LoggerFactory.getLogger(TestController.class);

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @GetMapping("/db")
  public ResponseEntity<String> testDbConnection() {
    logger.info("Testing database connection");
    try {
      Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
      logger.debug("Database test query successful with result: {}", result);
      return ResponseEntity.ok("Database connected! Test query result: " + result);
    } catch (Exception e) {
      logger.error("Database connection test failed: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("Database connection failed: " + e.getMessage());
    }
  }
}
