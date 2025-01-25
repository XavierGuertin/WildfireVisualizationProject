package com.example.backend.service;

import com.example.backend.repository.StacRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DataService {
  private static final Logger logger = LoggerFactory.getLogger(DataService.class);
  private static final String COLLECTIONS_URL = "https://hirondelle.crim.ca/stac/collections";

  private static final String DEFAULT_COLLECTION_JSON = """
    {
        "id": "synthetic-wildfire-collection",
        "type": "Collection",
        "stac_version": "1.0.0",
        "description": "A synthetic wildfire dataset for testing.",
        "extent": {
            "spatial": {"bbox": [[-180.0, -90.0, 180.0, 90.0]]},
            "temporal": {"interval": [["2023-01-01T00:00:00Z", "2023-12-31T23:59:59Z"]]}
        }
    }
    """;

  private static final String DEFAULT_COLLECTION_ID = "synthetic-wildfire-collection";

  @Autowired
  private StacRepository stacRepository;

  @Autowired
  private RestTemplate restTemplate;

  @Autowired
  private ObjectMapper objectMapper;

  public String insertAndQueryCollection() {
    return insertAndQueryCollection(DEFAULT_COLLECTION_JSON, DEFAULT_COLLECTION_ID);
  }

  public String insertAndQueryCollection(String collectionJson) {
    return insertAndQueryCollection(collectionJson, DEFAULT_COLLECTION_ID);
  }

  public String insertAndQueryCollection(String collectionJson, String collectionId) {
    logger.info("Starting insertAndQueryCollection process for collection ID: {}", collectionId);
    try {
      String finalCollectionJson = Optional.ofNullable(collectionJson)
        .orElse(DEFAULT_COLLECTION_JSON);
      String finalCollectionId = Optional.ofNullable(collectionId)
        .orElse(DEFAULT_COLLECTION_ID);

      logger.debug("Using collection JSON: {}", finalCollectionJson);
      logger.info("Checking if collection exists: {}", finalCollectionId);

      boolean exists = stacRepository.checkCollectionExists(finalCollectionId);

      if (!exists) {
        logger.info("Collection doesn't exist, inserting new collection...");
        stacRepository.insertCollection(finalCollectionJson);
      } else {
        logger.info("Collection already exists, skipping insertion");
      }

      logger.info("Querying collection...");
      List<Map<String, Object>> collectionData = stacRepository.queryCollection(finalCollectionId);
      logger.debug("Query completed, returned {} results", collectionData.size());

      return collectionData.isEmpty() ? "Collection not found" : objectMapper.writeValueAsString(collectionData);
    } catch (Exception e) {
      logger.error("Error in insertAndQueryCollection: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to process collection: " + e.getMessage(), e);
    }
  }

  public void fetchAndSaveCollections() {
    logger.info("Fetching collections from URL: {}", COLLECTIONS_URL);
    try {
      Map<String, Object> response = restTemplate.getForObject(COLLECTIONS_URL, Map.class);
      List<Map<String, Object>> collections = (List<Map<String, Object>>) response.get("collections");
      for (Map<String, Object> collection : collections) {
        String id = (String) collection.get("id");
        if (!stacRepository.checkCollectionExists(id)) {
          String collectionJson = objectMapper.writeValueAsString(collection);
          stacRepository.insertCollection(collectionJson);
        }
      }
      logger.info("Successfully fetched and saved collections");
    } catch (Exception e) {
      logger.error("Error fetching or saving collections: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch or save collections: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getCollections() {
    logger.info("Fetching collections from database");
    try {
      List<Map<String, Object>> collections = stacRepository.getAllCollections();
      return collections.stream()
        .map(collection -> Map.of("key", collection.get("key"), "id", collection.get("id")))
        .collect(Collectors.toList());
    } catch (Exception e) {
      logger.error("Error fetching collections: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch collections: " + e.getMessage(), e);
    }
  }

  public void deleteAllCollections() {
    logger.info("Deleting all collections");
    try {
      stacRepository.deleteAllCollections();
      logger.info("All collections deleted successfully");
    } catch (Exception e) {
      logger.error("Error deleting collections: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to delete collections: " + e.getMessage(), e);
    }
  }
}
