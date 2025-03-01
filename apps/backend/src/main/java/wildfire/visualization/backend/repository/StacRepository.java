package wildfire.visualization.backend.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Repository
public class StacRepository {
  private static final Logger logger = LoggerFactory.getLogger(StacRepository.class);
  private static final String FETCHING_ALL_COLLECTIONS = "Fetching all collections";
  private static final String FETCHING_WITH_BBOX = "Fetching collections with bbox: ";
  private static final String NO_BBOX = " (no bbox filter applied)";

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

  public boolean checkItemExists(String itemId) {
    try {
      String sql = "SELECT COUNT(*) FROM pgstac.items WHERE id = ?";
      Integer count = jdbcTemplate.queryForObject(sql, Integer.class, itemId);
      logger.debug("Item check result: count={}", count);
      return count != null && count > 0;
    } catch (DataAccessException e) {
      logger.error("Error checking item existence: {}", e.getMessage(), e);
      throw new RuntimeException("Error checking item existence: " + e.getMessage(), e);
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

  private List<Map<String, Object>> fetchCollections(double[] bbox, String orderBy) {
    String bboxMessage = (bbox == null)
        ? FETCHING_ALL_COLLECTIONS + (orderBy.isEmpty() ? NO_BBOX : " sorted by " + orderBy + NO_BBOX)
        : FETCHING_WITH_BBOX + Arrays.toString(bbox);

    logger.debug(bboxMessage);

    try {
      String sql = "WITH bbox_data AS ( " +
          "  SELECT key, id, content->'extent'->'spatial'->'bbox' AS bbox_array, datetime " +
          "  FROM pgstac.collections " +
          ") " +
          "SELECT key, id, bbox_array AS bbox " +
          "FROM bbox_data ";

      if (bbox != null) {
        sql += "WHERE ST_Intersects( " +
            "  ST_MakeEnvelope(?, ?, ?, ?, 4326), " +
            "  ST_SetSRID(ST_MakeEnvelope( " +
            "    (bbox_array->0->>0)::double precision, " +
            "    (bbox_array->0->>1)::double precision, " +
            "    (bbox_array->0->>2)::double precision, " +
            "    (bbox_array->0->>3)::double precision, 4326), 4326) " +
            ") ";
      }

      if (!orderBy.isEmpty()) {
        sql += "ORDER BY " + orderBy + ";";
      }

      List<Map<String, Object>> results;

      if (bbox != null) {
        results = jdbcTemplate.queryForList(sql, bbox[0], bbox[1], bbox[2], bbox[3]);
      } else {
        results = jdbcTemplate.queryForList(sql);
      }

      logger.debug("Fetched {} collections", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching collections: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching collections: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getAllCollections(double[] bbox) {
    return fetchCollections(bbox, ""); // No ordering applied
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

  public List<Map<String, Object>> getAllCollectionsByName(double[] bbox) {
    return fetchCollections(bbox, "id"); // Order by Name (ID)
  }

  public List<Map<String, Object>> getAllCollectionsByDate(double[] bbox) {
    return fetchCollections(bbox, "datetime"); // Order by Date
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

  public void insertItem(String itemJson) {
    logger.debug("Attempting to insert item");
    try {
      jdbcTemplate.queryForObject(
          "SELECT pgstac.create_item(?::jsonb)",
          Object.class,
          itemJson);
      logger.info("Successfully inserted item");
    } catch (DataAccessException e) {
      logger.error("Error inserting item: {}", e.getMessage(), e);
      throw new RuntimeException("Error inserting item: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getAllItems(String collectionId) {
    logger.debug("Fetching items");
    try {
      String sql = "SELECT * FROM pgstac.search(" +
          "    '{" +
          "        \"filter\": {" +
          "            \"op\": \"=\"," +
          "            \"args\": [" +
          "                { \"property\": \"collection\" }," +
          "                \"" + collectionId + "\"" +
          "            ]" +
          "        }" +
          "    }'::jsonb" +
          ")";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
      logger.debug("Query returned {} results", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching items: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching items: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getItem(String id) {
    logger.debug("Fetching item");
    try {
      String sql = "SELECT pgstac.get_item('" + id + "');";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
      logger.debug("Query returned {} results", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching item: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getItem(String id, String collection) {
    logger.debug("Fetching item");
    try {
      String sql = "SELECT pgstac.get_item('" + id + "', '" + collection + "');";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
      logger.debug("Query returned {} results", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching item: " + e.getMessage(), e);
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

  public String removeAllItems() {
    logger.debug("Removing all items");
    try {
      String sql = "DO $$ \n" +
          "DECLARE\n" +
          "    rec RECORD;\n" +
          "BEGIN\n" +
          "    SET search_path = pgstac, public;\n" +
          "\n" +
          "    FOR rec IN SELECT id, collection FROM items LOOP\n" +
          "        PERFORM delete_item(rec.id, rec.collection);\n" +
          "    END LOOP;\n" +
          "END $$;\n";

      jdbcTemplate.execute(sql);
      return "Successfully Removed All Items";
    } catch (DataAccessException e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching item: " + e.getMessage(), e);
    }
  }

  public String removeItemsFromCollection(String collectionId) {
    logger.debug("Removing all items from collection");
    try {
      String sql = "DO $$ \n" +
          "DECLARE\n" +
          "    rec RECORD;\n" +
          "    target_collection_id text := '" + collectionId + "';\n" +
          "BEGIN\n" +
          "    SET search_path = pgstac, public;\n" +
          "\n" +
          "    FOR rec IN SELECT id FROM items WHERE collection = target_collection_id LOOP\n" +
          "        PERFORM delete_item(rec.id, target_collection_id);\n" +
          "    END LOOP;\n" +
          "END $$;\n";

      jdbcTemplate.execute(sql);
      return "Successfully Removed All Items From Collection";
    } catch (DataAccessException e) {
      logger.error("Error removing items from collection: {}", e.getMessage(), e);
      throw new RuntimeException("Error removing items from collection: " + e.getMessage(), e);
    }
  }

  public String removeItem(String itemId, String collectionId) {
    logger.debug("Removing item");
    try {
      String sql = "SELECT delete_item('" + itemId + "', '" + collectionId + "');";

      jdbcTemplate.execute(sql);
      return "Successfully Removed Item";
    } catch (DataAccessException e) {
      logger.error("Error removing item: {}", e.getMessage(), e);
      throw new RuntimeException("Error removing item: " + e.getMessage(), e);
    }
  }
}
