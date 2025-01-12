package com.example.backend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository
public class StacRepository {
  private static final Logger logger = LoggerFactory.getLogger(StacRepository.class);

  @Autowired
  private JdbcTemplate jdbcTemplate;

  public boolean checkCollectionExists(String collectionId) {
    logger.debug("Checking if collection exists: {}", collectionId);
    try {
      String sql = "SELECT COUNT(*) FROM pgstac.collections WHERE id = ?";
      Integer count = jdbcTemplate.queryForObject(sql, Integer.class, collectionId);
      logger.debug("Collection check result: count={}", count);
      return count != null && count > 0;
    } catch (DataAccessException e) {
      logger.error("Error checking collection existence: {}", e.getMessage(), e);
      throw new RuntimeException("Error checking collection existence: " + e.getMessage(), e);
    }
  }

  public void insertCollection(String collectionJson) {
    logger.debug("Attempting to insert collection");
    try {
      jdbcTemplate.queryForObject(
        "SELECT pgstac.create_collection(?::jsonb)",
        Object.class,
        collectionJson
      );
      logger.info("Successfully inserted collection");
    } catch (DataAccessException e) {
      logger.error("Error inserting collection: {}", e.getMessage(), e);
      throw new RuntimeException("Error inserting collection: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> queryCollection(String collectionId) {
    logger.debug("Querying collection: {}", collectionId);
    try {
      String sql = "SELECT * FROM pgstac.collections WHERE id = ?";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, collectionId);
      logger.debug("Query returned {} results", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error querying collection: {}", e.getMessage(), e);
      throw new RuntimeException("Error querying collection: " + e.getMessage(), e);
    }
  }
}
