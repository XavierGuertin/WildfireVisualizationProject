package com.example.backend;

import com.example.backend.controller.DataController;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*
 * Various types of logs:
 * logger.debug("Debug Log!");
 * logger.info("Info Log!");
 * logger.warn("Warning Log!");
 * logger.error("Error Log!");
 * logger.fatal("Fatal Log!");
 */

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

  private static final Logger logger = LogManager.getLogger(BackendApplication.class);

  private static final String DEFAULT_ENDPOINT_URL = "https://hirondelle.crim.ca/stac/collections";

  @Autowired
  private DataController dataController;

  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
  }

  @Override
  public void run(String... args) {
    logger.info("Fetching and saving collections on startup");
    dataController.fetchCollections(DEFAULT_ENDPOINT_URL);
  }
}
