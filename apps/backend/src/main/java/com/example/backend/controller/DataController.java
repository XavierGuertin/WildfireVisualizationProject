package com.example.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.service.DataService;

@RestController
public class DataController {
  private static final Logger logger = LoggerFactory.getLogger(DataController.class);

  @Autowired
  private DataService dataService;

  @GetMapping("/api/data")
  public ResponseEntity<String> getData() {
    logger.info("Received request to /api/data");
    try {
      ClassPathResource resource = new ClassPathResource("synthetic_wildfire_collection.json");
      String jsonData = Files.readString(resource.getFile().toPath());
      logger.debug("Successfully read JSON file");
      return ResponseEntity.ok(jsonData);
    } catch (IOException e) {
      logger.error("Error reading JSON file: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body("Error reading file: " + e.getMessage());
    }
  }

  @GetMapping("/api/test-stac")
  public ResponseEntity<String> testStacEndpoint() {
    logger.info("Received request to /api/test-stac");
    try {
      String result = dataService.insertAndQueryCollection();
      logger.debug("Successfully processed STAC data");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error in STAC endpoint: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body("Error processing STAC data: " + e.getMessage());
    }
  }

  @GetMapping("/api/metadata/{id}")
  public ResponseEntity<String> getMetaData(@PathVariable("id") String collectionId) {
    logger.info("Received request to /api/metadata");
    try {
      String result = dataService.retrieveMetaData(collectionId);
      logger.debug("Successfully processed MetaData");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error in MetaData endpoint: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
        .body("Error processing MetaData: " + e.getMessage());
    }
  }

  @PostMapping("/api/stac/collection")
  public ResponseEntity<String> createCollection(@RequestBody String collectionJson) {
    logger.info("Received request to create collection");
    try {
      String result = dataService.insertAndQueryCollection(collectionJson);
      logger.debug("Successfully processed custom collection");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error creating collection: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body("Error creating collection: " + e.getMessage());
    }
  }

  @GetMapping("/api/fetch-collections")
  public ResponseEntity<String> fetchCollections() {
    logger.info("Received request to fetch and save collections");
    try {
      dataService.fetchAndSaveCollections();
      return ResponseEntity.ok("Collections fetched and saved successfully");
    } catch (Exception e) {
      logger.error("Error fetching collections: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body("Error fetching collections: " + e.getMessage());
    }
  }

  @GetMapping("/api/get-collections")
  public ResponseEntity<List<Map<String, Object>>> getCollections() {
    logger.info("Received request to get collections");
    try {
      List<Map<String, Object>> collections = dataService.getCollections();
      logger.debug("Successfully fetched collections");
      return ResponseEntity.ok(collections);
    } catch (Exception e) {
      logger.error("Error fetching collections: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("/api/reset-collections")
  public ResponseEntity<String> resetCollections() {
    logger.info("Received request to reset collections");
    try {
      dataService.deleteAllCollections();
      return ResponseEntity.ok("Collections deleted successfully");
    } catch (Exception e) {
      logger.error("Error resetting collections: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body("Error resetting collections: " + e.getMessage());
    }
  }

  @GetMapping("/api/get-collections-by-name")
  public ResponseEntity<List<Map<String, Object>>> getCollectionsByName() {
    logger.info("Received request to get collections by name");
    try {
      List<Map<String, Object>> collections = dataService.getCollectionsByName();
      logger.debug("Successfully fetched collections by name");
      return ResponseEntity.ok(collections);
    } catch (Exception e) {
      logger.error("Error fetching collections by name: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("/api/get-collections-by-date")
  public ResponseEntity<List<Map<String, Object>>> getCollectionsByDate() {
    logger.info("Received request to get collections by name");
    try {
      List<Map<String, Object>> collections = dataService.getCollectionsByDate();
      logger.debug("Successfully fetched collections by name");
      return ResponseEntity.ok(collections);
    } catch (Exception e) {
      logger.error("Error fetching collections by name: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }
  
}
