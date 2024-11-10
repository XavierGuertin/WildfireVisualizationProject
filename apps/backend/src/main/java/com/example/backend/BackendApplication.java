package com.example.backend;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

//import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.context.annotation.Bean;

/*
 * Various types of logs:
 * logger.debug("Debug Log!");
 * logger.info("Info Log!");
 * logger.warn("Warning Log!");
 * logger.error("Error Log!");
 * logger.fatal("Fatal Log!");
 */

@SpringBootApplication
public class BackendApplication {

  private static final Logger logger = LogManager.getLogger(BackendApplication.class);
  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);

  }
}
