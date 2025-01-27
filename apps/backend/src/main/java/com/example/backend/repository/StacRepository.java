package com.example.backend.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

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
          collectionJson);
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

  public List<Map<String, Object>> getAllCollections() {
    logger.debug("Fetching all collections");
    try {
      String sql = "SELECT * FROM pgstac.collections";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
      logger.debug("Query returned {} results", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching all collections: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching all collections: " + e.getMessage(), e);
    }
  }

  public void deleteAllCollections() {
    logger.info("Deleting all collections from pgstac.collections");
    try {
      String sql = "DELETE FROM pgstac.collections";
      jdbcTemplate.update(sql);
      logger.info("All collections deleted successfully");
    } catch (DataAccessException e) {
      logger.error("Error deleting collections: {}", e.getMessage(), e);
      throw new RuntimeException("Error deleting collections: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> queryMetaData(String collectionId) {
    logger.debug("Querying metadata for: {}", collectionId);
    try {
      String sql = "SELECT (content ->> 'title') AS title," +
          " (content ->> 'description') AS description," +
          " datetime AS datetime," +
          " end_datetime as end_datetime," +
          " (content -> 'links') as links" +
          " FROM pgstac.collections WHERE id = ?";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, collectionId);
      logger.debug("Query returned {} results", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error querying collection: {}", e.getMessage(), e);
      throw new RuntimeException("Error querying collection: " + e.getMessage(), e);
    }
  }

  public void setDatalayerView(String collectionId) {
    logger.info("Attempting to create / insert geometry of selected dataset into datalayer view: {}", collectionId);
    try {
      // Safely escape single quotes by replacing them with double single quotes
      String safeCollectionId = collectionId.replace("'", "''");

      String sqlDrop = "DROP VIEW IF EXISTS Datalayer";

      jdbcTemplate.execute(sqlDrop);

      String sqlInsert = "CREATE VIEW DataLayer AS" +
          " SELECT geometry FROM pgstac.collections WHERE id = '" + safeCollectionId + "'";

      jdbcTemplate.execute(sqlInsert);

      logger.info("Successfully created/replaced view for collectionId: {}", collectionId);
    } catch (DataAccessException e) {
      logger.error("Error inserting view: {}", e.getMessage(), e);
      throw new RuntimeException("Error inserting view: " + e.getMessage(), e);
    }
  }

  public boolean checkDatalayerView() {
    try {
      // Ensure correct case and schema handling
      String sql = "SELECT COUNT(*) FROM DataLayer";

      logger.info("Executing SQL: {}", sql);

      int result = jdbcTemplate.queryForObject(sql, Integer.class);

      return result == 1; // If ID exists, return true
    } catch (EmptyResultDataAccessException e) {
      logger.info("No data found: {}");
      return false;
    } catch (DataAccessException e) {
      logger.error("Error querying DataLayer: {}", e.getMessage(), e);
      return false;
    }
  }
}
