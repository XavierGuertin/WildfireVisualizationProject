package com.example.backend.service;

import com.example.backend.repository.StacRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DataService {
  private static final Logger logger = LoggerFactory.getLogger(DataService.class);

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

      return collectionData.isEmpty() ? "Collection not found" : collectionData.toString();
    } catch (Exception e) {
      logger.error("Error in insertAndQueryCollection: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to process collection: " + e.getMessage(), e);
    }
  }
}
