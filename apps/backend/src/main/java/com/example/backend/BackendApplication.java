package com.example.backend;

import com.example.backend.service.DataService;
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

  @Autowired
  private DataService dataService;

  public static void main(String[] args) {
    SpringApplication.run(BackendApplication.class, args);
  }

  @Override
  public void run(String... args) throws Exception {
//    logger.info("Creating schema if does not exists");
//    dataService.createSchemaIfNotExists();
    logger.info("Fetching and saving collections on startup");
    dataService.fetchAndSaveCollections();
  }
}
