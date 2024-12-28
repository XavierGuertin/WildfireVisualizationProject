package com.example.backend.service;

import com.example.backend.repository.StacRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class DataService {
  private static final Logger logger = LoggerFactory.getLogger(DataService.class);

  @Autowired
  private StacRepository stacRepository;

  public String insertAndQueryCollection() {
    try {
      String collectionJson = """
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

      logger.info("Checking if collection exists...");
      boolean exists = stacRepository.checkCollectionExists("synthetic-wildfire-collection");

      if (!exists) {
        logger.info("Collection doesn't exist, inserting new collection...");
        stacRepository.insertCollection(collectionJson);
      } else {
        logger.info("Collection already exists");
      }

      logger.info("Querying collection...");
      List<Map<String, Object>> collectionData = stacRepository.queryCollection("synthetic-wildfire-collection");

      return collectionData.isEmpty() ? "Collection not found" : collectionData.toString();
    } catch (Exception e) {
      logger.error("Error in insertAndQueryCollection", e);
      throw new RuntimeException("Failed to process collection: " + e.getMessage(), e);
    }
  }
}
