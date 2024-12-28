package com.example.backend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Map;

@Repository
public class StacRepository {
  @Autowired
  private JdbcTemplate jdbcTemplate;

  public boolean checkCollectionExists(String collectionId) {
    try {
      String sql = "SELECT COUNT(*) FROM pgstac.collections WHERE id = ?";
      Integer count = jdbcTemplate.queryForObject(sql, Integer.class, collectionId);
      return count != null && count > 0;
    } catch (DataAccessException e) {
      throw new RuntimeException("Error checking collection existence: " + e.getMessage(), e);
    }
  }

  public void insertCollection(String collectionJson) {
    try {
      String sql = "SELECT pgstac.insert_collection(?)";
      jdbcTemplate.update(sql, collectionJson);
    } catch (DataAccessException e) {
      throw new RuntimeException("Error inserting collection: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> queryCollection(String collectionId) {
    try {
      String sql = "SELECT * FROM pgstac.collections WHERE id = ?";
      return jdbcTemplate.queryForList(sql, collectionId);
    } catch (DataAccessException e) {
      throw new RuntimeException("Error querying collection: " + e.getMessage(), e);
    }
  }
}
