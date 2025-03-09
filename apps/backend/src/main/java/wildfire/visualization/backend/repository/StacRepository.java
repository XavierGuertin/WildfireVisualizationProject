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
import java.util.TimeZone;

/**
 * Repository responsible for directly communicating with the pgSTAC database (items and collections)
 */
@Repository
public class StacRepository {
  private static final Logger logger = LoggerFactory.getLogger(StacRepository.class);
  private static final String FETCHING_ALL_COLLECTIONS = "Fetching all collections";
  private static final String FETCHING_WITH_BBOX = "Fetching collections with bbox: ";

  @Autowired
  private JdbcTemplate jdbcTemplate;

  /**
   * Method responsible for checking if a collection exists with a given id
   *
   * @param collectionId Database ID of the given collection
   * @return boolean value that clarifies whether the collection exists or not
   */
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

  /**
   * Method responsible for checking if an item exists with the given id
   *
   * @param itemId Database ID of the given item
   * @return boolean value that clarifies whether the item exists or not
   */
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

  /**
   * Method responsible for inserting a collection into the database
   *
   * @param collectionJson Stringified JSON object containing the collection data
   */
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

  public void insertItem(String itemJson) {
    logger.debug("Attempting to insert item");
    try {
      jdbcTemplate.queryForObject(
        "SELECT pgstac.create_item(?::jsonb)",
        Object.class,
        itemJson);
      logger.info("Successfully inserted item");
    } catch (DataAccessException e) {
      logger.error("Error inserting collection: {}", e.getMessage(), e);
      throw new RuntimeException("Error inserting collection: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for querying a collection with a given id
   *
   * @param collectionId Database ID of the given collection
   * @return List object containing the data of the given collection
   */
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

  /**
   * Fetches a list of collections from the database, optionally filtered by a
   * bounding box (BBOX)
   * and sorted by a specified column.
   *
   * @param bbox    An optional bounding box filter (minX, minY, maxX, maxY). If
   *                null, no filter is applied.
   * @param orderBy The column by which to order results (e.g., "id" or
   *                "datetime"). If empty, no ordering is applied.
   * @return A list of collections as key-value maps, containing collection
   *         metadata.
   * @throws IllegalArgumentException If `bbox` is not null and does not contain
   *                                  exactly 4 elements.
   * @throws RuntimeException         If a database error occurs.
   */
  List<Map<String, Object>> fetchCollections(double[] bbox, String orderBy) {
    // Ensure bounding box contains exactly 4 elements (minX, minY, maxX, maxY)
    if (bbox != null && bbox.length != 4) {
      throw new IllegalArgumentException("Bounding box must have exactly 4 elements (minX, minY, maxX, maxY)");
    }

    // Log query type (bbox filtering or not)
    if (bbox == null) {
      logger.debug(FETCHING_ALL_COLLECTIONS + (orderBy.isEmpty() ? "" : " sorted by " + orderBy));
    } else {
      logger.debug(FETCHING_WITH_BBOX + Arrays.toString(bbox));
    }

    try {
      // Base SQL query for fetching collections
      String sql = "WITH bbox_data AS ( " +
          "  SELECT key, id, content->'extent'->'spatial'->'bbox' AS bbox_array, datetime " +
          "  FROM pgstac.collections " +
          ") " +
          "SELECT key, id, bbox_array AS bbox " +
          "FROM bbox_data ";

      // Apply bounding box filtering if provided
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

      // Validate and apply ordering if provided
      if (!orderBy.isEmpty()) {
        if (!Arrays.asList("id", "datetime").contains(orderBy)) {
          throw new IllegalArgumentException("Invalid orderBy column: " + orderBy);
        }
        sql += " ORDER BY " + orderBy;
      }

      // Execute query and fetch results
      List<Map<String, Object>> results = (bbox != null)
          ? jdbcTemplate.queryForList(sql, bbox[0], bbox[1], bbox[2], bbox[3])
          : jdbcTemplate.queryForList(sql);

      logger.info("Successfully fetched {} collections.", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Database error while fetching collections: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching collections: " + e.getMessage(), e);
    }
  }

  /**
   * Retrieves all collections from the database, optionally filtered by a
   * bounding box (BBOX).
   *
   * @param bbox An optional bounding box filter (minX, minY, maxX, maxY). If
   *             null, no filter is applied.
   * @return A list of all collections in the database.
   */
  public List<Map<String, Object>> getAllCollections(double[] bbox) {
    return fetchCollections(bbox, ""); // No ordering applied
  }

  public void deleteAllCollections() {
    try {
      String sql = "DELETE FROM pgstac.datalayer";
      logger.info("Deleting Datalayer view from pgstac.collections");
      jdbcTemplate.update(sql);
      logger.info("Datalayer view deleted successfully");

      sql = "DELETE FROM pgstac.collections";
      logger.info("Deleting all collections from pgstac.collections");
      jdbcTemplate.update(sql);
      logger.info("All collections deleted successfully");
    } catch (DataAccessException e) {
      logger.error("Error deleting collections: {}", e.getMessage(), e);
      throw new RuntimeException("Error deleting collections: " + e.getMessage(), e);
    }
  }

  public List<String> getItemsTimestamps() {
    String sql = "SELECT to_char(datetime AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as iso FROM pgstac.items ORDER BY datetime ASC";
    try {
      TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
      List<String> timestamps = jdbcTemplate.queryForList(sql, String.class);
      logger.info("Fetched {} item timestamps", timestamps.size());
      return timestamps;
    } catch (DataAccessException e) {
      logger.error("Error fetching item timestamps: {}", e.getMessage(), e);
      throw new RuntimeException("Error fetching item timestamps: " + e.getMessage(), e);
    }
  }

  public void deleteAllItems() {
    logger.info("Deleting all items from pgstac.items");
    try {
      String sql = "DELETE FROM pgstac.items";
      jdbcTemplate.update(sql);
      logger.info("All items deleted successfully");
    } catch (DataAccessException e) {
      logger.error("Error deleting items: {}", e.getMessage(), e);
      throw new RuntimeException("Error deleting items: " + e.getMessage(), e);
    }
  }


  /**
   * Retrieves all collections from the database, optionally filtered by a
   * bounding box (BBOX),
   * and sorted by collection name (ID).
   *
   * @param bbox An optional bounding box filter (minX, minY, maxX, maxY). If
   *             null, no filter is applied.
   * @return A list of collections sorted by name.
   */
  public List<Map<String, Object>> getAllCollectionsByName(double[] bbox) {
    return fetchCollections(bbox, "id"); // Order by collection name (ID)
  }

  /**
   * Retrieves all collections from the database, optionally filtered by a
   * bounding box (BBOX),
   * and sorted by date.
   *
   * @param bbox An optional bounding box filter (minX, minY, maxX, maxY). If
   *             null, no filter is applied.
   * @return A list of collections sorted by date.
   */
  public List<Map<String, Object>> getAllCollectionsByDate(double[] bbox) {
    return fetchCollections(bbox, "datetime"); // Order by date
  }

  /**
   * Method responsible for fetching the metadata from a given collection
   *
   * @param collectionId Database ID of the given collection
   * @return List object containing the given collection's metadata
   */
  public List<Map<String, Object>> queryCollectionMetaData(String collectionId) {
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

  /**
   * Method responsible for retrieving an item from the database
   *
   * @param id Database ID of item to be fetched
   * @return List object containing the item with the given id
   */
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

  /**
   *  Method responsible for retrieving an item from the database from a given collection
   *
   * @param id Database ID of item to be retrieved
   * @param collection Database ID of collection to retrieve items from
   * @return List object containing the item with the given id from the given collection
   */
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

  /**
   * Method responsible for setting a DataLayerView in the database
   *
   * @param collectionId Database ID of the given collection
   */
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

  /**
   * Method responsible for resetting the Datalayer View
   *
   * @param collectionId Database ID of the given collection
   */
  public void resetDatalayerView() {
    try {
      logger.info("Attempting to reset Datalayer view");
      String sql = "DROP VIEW IF EXISTS Datalayer";
      jdbcTemplate.execute(sql);
      logger.info("Successfully reset the Datalayer view");
    } catch(DataAccessException e) {
      logger.error("Error resetting Datalayer view: {}", e.getMessage(), e);
      throw new RuntimeException("Error resetting Datalayer view: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for checking if DataLayerView exists
   *
   * @return boolean value clarifying if the DataLayerView exists or not
   */
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

  /**
   * Method responsible for removing all items from the database
   *
   * @return String object to clarify if removal was successful
   */
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

  /**
   * Method responsible for removing all items of a given collection from the database
   *
   * @param collectionId Database ID of the given collection
   * @return String object to clarify if removal was successful
   */
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

  /**
   * Method responsible for removing an item of a given collection from the database
   * @param itemId Database ID of item to be removed
   * @param collectionId Database ID of collection that the item pertains to
   * @return String object to clarify if removal was successful
   */
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
