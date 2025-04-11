package wildfire.visualization.backend.repository;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import wildfire.visualization.backend.exception.RepositoryException;

/**
 * Repository responsible for directly communicating with the pgSTAC database
 * (items and collections)
 */
@Repository
public class StacRepository {
  private static final Logger logger = LoggerFactory.getLogger(StacRepository.class);
  private static final String FETCHING_ALL_COLLECTIONS = "Fetching all collections";
  private static final String FETCHING_WITH_BBOX = "Fetching collections with bbox: ";
  private static final String QUERY_RETURNED_RESULTS = "Query returned {} results";

  private final JdbcTemplate jdbcTemplate;

  public StacRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  /**
   * Method responsible for checking if a collection exists with a given id
   *
   * @param collectionId Database ID of the given collection
   * @return boolean value that clarifies whether the collection exists or not
   * @throws RepositoryException if a database error occurs
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
      throw new RepositoryException("Error checking if collection exists: " + collectionId, e);
    }
  }

  /**
   * Method responsible for checking if an item exists with the given id
   *
   * @param itemId Database ID of the given item
   * @return boolean value that clarifies whether the item exists or not
   * @throws RepositoryException if a database error occurs
   */
  public boolean checkItemExists(String itemId) {
    try {
      String sql = "SELECT COUNT(*) FROM pgstac.items WHERE id = ?";
      Integer count = jdbcTemplate.queryForObject(sql, Integer.class, itemId);
      logger.debug("Item check result: count={}", count);
      return count != null && count > 0;
    } catch (DataAccessException e) {
      logger.error("Error checking item existence: {}", e.getMessage(), e);
      throw new RepositoryException("Error checking if item exists: " + itemId, e);
    }
  }

  /**
   * Method responsible for inserting a collection into the database
   *
   * @param collectionJson Stringified JSON object containing the collection data
   * @throws RepositoryException if a database error occurs
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
      throw new RepositoryException("Error inserting collection", e);
    }
  }

  /**
   * Method responsible for inserting an item into the database
   *
   * @param itemJson Stringified JSON object containing the item data
   * @throws RepositoryException if a database error occurs
   */
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
      throw new RepositoryException("Error inserting item", e);
    }
  }

  /**
   * Method responsible for querying a collection with a given id
   *
   * @param collectionId Database ID of the given collection
   * @return List object containing the data of the given collection
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> queryCollection(String collectionId) {
    logger.debug("Querying collection: {}", collectionId);
    try {
      String sql = "SELECT * FROM pgstac.collections WHERE id = ?";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, collectionId);
      logger.debug(QUERY_RETURNED_RESULTS, results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error querying collection: {}", e.getMessage(), e);
      throw new RepositoryException("Error querying collection: " + collectionId, e);
    }
  }

  /**
   * Fetches a list of collections from the database, optionally filtered by a
   * bounding box (BBOX) and sorted with specified column and direction.
   *
   * @param bbox          An optional bounding box filter (minX, minY, maxX,
   *                      maxY). If
   *                      null, no filter is applied.
   * @param orderBy       The column by which to order results (e.g., "id" or
   *                      "datetime").
   *                      If empty, no ordering is applied.
   * @param sortDirection The direction to sort ("asc" or "desc"). Defaults to
   *                      "asc" if invalid.
   * @return A list of collections as key-value maps, containing collection
   *         metadata.
   * @throws RepositoryException If a database error occurs or inputs are invalid
   */
  List<Map<String, Object>> fetchCollections(double[] bbox, String orderBy, String sortDirection) {
    // Ensure bounding box contains exactly 4 elements (minX, minY, maxX, maxY)
    if (bbox != null && bbox.length != 4) {
      throw new RepositoryException("Bounding box must have exactly 4 elements (minX, minY, maxX, maxY)");
    }

    // Validate sort direction
    String direction = "asc".equalsIgnoreCase(sortDirection) || "desc".equalsIgnoreCase(sortDirection)
        ? sortDirection.toLowerCase()
        : "asc";

    // Log query type (bbox filtering or not)
    if (bbox == null) {
      logger.debug(FETCHING_ALL_COLLECTIONS + (orderBy.isEmpty() ? "" : " sorted by " + orderBy + " " + direction));
    } else {
      logger.debug(FETCHING_WITH_BBOX + Arrays.toString(bbox)
          + (orderBy.isEmpty() ? "" : " sorted by " + orderBy + " " + direction));
    }

    try {
      // Base SQL query for fetching collections
      String sql = "WITH bbox_data AS ( " +
        "  SELECT key, id, content->>'title' AS title, content->'extent'->'spatial'->'bbox' AS bbox_array, datetime " +
        "  FROM pgstac.collections " +
        ") " +
        "SELECT key, id, title, bbox_array AS bbox " +
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
        if (!Arrays.asList("id", "datetime", "title").contains(orderBy)) {
          throw new RepositoryException("Invalid orderBy column: " + orderBy);
        }
        sql += " ORDER BY " + orderBy + " " + direction;
      }

      // Execute query and fetch results
      List<Map<String, Object>> results = (bbox != null)
          ? jdbcTemplate.queryForList(sql, bbox[0], bbox[1], bbox[2], bbox[3])
          : jdbcTemplate.queryForList(sql);

      logger.info("Successfully fetched {} collections.", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Database error while fetching collections: {}", e.getMessage(), e);
      throw new RepositoryException("Error fetching collections", e);
    }
  }

  /**
   * Retrieves all collections from the database, optionally filtered by a
   * bounding box (BBOX).
   *
   * @param bbox An optional bounding box filter (minX, minY, maxX, maxY). If
   *             null, no filter is applied.
   * @return A list of all collections in the database.
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> getAllCollections(double[] bbox) {
    return fetchCollections(bbox, "", "asc"); // No ordering applied, default ascending
  }

  /**
   * Deletes all collections from the database
   *
   * @throws RepositoryException if a database error occurs
   */
  public void deleteAllCollections() {
    try {
      String sql = "DELETE FROM pgstac.collections";
      logger.info("Deleting all collections from pgstac.collections");
      jdbcTemplate.update(sql);
      logger.info("All collections deleted successfully");
    } catch (DataAccessException e) {
      logger.error("Error deleting collections: {}", e.getMessage(), e);
      throw new RepositoryException("Error deleting all collections", e);
    }
  }

  /**
   * Retrieves timestamps of all items in the database
   *
   * @return List of timestamps as strings
   * @throws RepositoryException if a database error occurs
   */
  public List<String> getItemsTimestamps() {
    String sql = "SELECT to_char(datetime AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as iso FROM pgstac.items ORDER BY datetime ASC";
    try {
      TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
      List<String> timestamps = jdbcTemplate.queryForList(sql, String.class);
      logger.info("Fetched {} item timestamps", timestamps.size());
      return timestamps;
    } catch (DataAccessException e) {
      logger.error("Error fetching item timestamps: {}", e.getMessage(), e);
      throw new RepositoryException("Error fetching item timestamps", e);
    }
  }

  /**
   *
   * Retrieves item IDs from the database, ordered by datetime ascending (UTC).*
   *
   * @return List of item IDs
   * @throws RepositoryException if a database error occurs
   */
  public List<String> getItemsIdsOrderedByTimestamp() {
    String sql = "SELECT id FROM pgstac.items ORDER BY datetime AT TIME ZONE 'UTC' ASC";
    try {
      TimeZone.setDefault(TimeZone.getTimeZone("UTC")); // Match behavior of getItemsTimestamps()
      List<String> itemIds = jdbcTemplate.queryForList(sql, String.class);
      logger.info("Fetched {} item IDs ordered by UTC datetime", itemIds.size());
      return itemIds;
    } catch (DataAccessException e) {
      logger.error("Error fetching item IDs: {}", e.getMessage(), e);
      throw new RepositoryException("Error fetching item IDs", e);
    }
  }

  /**
   * Deletes all items from the database
   *
   * @throws RepositoryException if a database error occurs
   */
  public void deleteAllItems() {
    logger.info("Deleting all items from pgstac.items");
    try {
      String sql = "DELETE FROM pgstac.items";
      jdbcTemplate.update(sql);
      logger.info("All items deleted successfully");
    } catch (DataAccessException e) {
      logger.error("Error deleting items: {}", e.getMessage(), e);
      throw new RepositoryException("Error deleting all items", e);
    }
  }

  /**
   * Retrieves all collections from the database, optionally filtered by a
   * bounding box (BBOX), and sorted by collection name (ID) with specified
   * direction.
   *
   * @param bbox          An optional bounding box filter (minX, minY, maxX,
   *                      maxY). If
   *                      null, no filter is applied.
   * @param sortDirection The direction to sort ("asc" or "desc").
   * @return A list of collections sorted by name.
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> getAllCollectionsByName(double[] bbox, String sortDirection) {
    return fetchCollections(bbox, "title", sortDirection);
  }

  /**
   * Retrieves all collections from the database, optionally filtered by a
   * bounding box (BBOX),
   * and sorted by date with specified direction.
   *
   * @param bbox          An optional bounding box filter (minX, minY, maxX,
   *                      maxY). If
   *                      null, no filter is applied.
   * @param sortDirection The direction to sort ("asc" or "desc").
   * @return A list of collections sorted by date.
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> getAllCollectionsByDate(double[] bbox, String sortDirection) {
    return fetchCollections(bbox, "datetime", sortDirection);
  }

  /**
   * Method responsible for fetching the metadata from a given collection,
   * including item count from `stats:items.count`.
   *
   * @param collectionId Database ID of the given collection
   * @return List object containing the given collection's metadata
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> queryCollectionMetaData(String collectionId) {
    logger.debug("Querying metadata for: {}", collectionId);
    try {
      String sql = "SELECT (content ->> 'title') AS title," +
          " (content ->> 'description') AS description," +
          " datetime AS datetime," +
          " end_datetime AS end_datetime," +
          " (content -> 'links') AS links," +
          " (content -> 'stats:items' ->> 'count')::int AS item_count " + // Extract item count
          " FROM pgstac.collections WHERE id = ?";

      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, collectionId);

      logger.debug("Query returned {} results with item count", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error querying collection metadata: {}", e.getMessage(), e);
      throw new RepositoryException("Error querying metadata for collection: " + collectionId, e);
    }
  }

  /**
   * Retrieves all items from a specific collection
   *
   * @param collectionId ID of the collection to retrieve items from
   * @return List of maps containing item data
   * @throws RepositoryException if a database error occurs
   */

  public List<Map<String, Object>> getAllItems(String collectionId) {
    logger.debug("Fetching items for collection: {}", collectionId);
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

      logger.debug(QUERY_RETURNED_RESULTS, results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching items: {}", e.getMessage(), e);
      throw new RepositoryException("Error fetching items for collection: " + collectionId, e);
    }
  }

  /**
   * Retrieves all items from the database
   *
   * @return List of maps containing item data
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> getAllItemsFromCollection(String collectionId) {
    logger.debug("Fetching items for collection: {}", collectionId);
    try {
      String sql = "SELECT * FROM pgstac.items WHERE collection = ?";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, collectionId);
      logger.debug("Query returned {} results", results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching items: {}", e.getMessage(), e);
      throw new RepositoryException("Error fetching items for collection: " + collectionId, e);
    }
  }


  /**
   * Method responsible for retrieving an item from the database
   *
   * @param id Database ID of item to be fetched
   * @return List object containing the item with the given id
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> getItem(String id) {
    logger.debug("Fetching item with ID: {}", id);
    try {
      String sql = "SELECT pgstac.get_item('" + id + "');";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
      logger.debug(QUERY_RETURNED_RESULTS, results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RepositoryException("Error fetching item with ID: " + id, e);
    }
  }

  /**
   * Method responsible for retrieving an item from the database from a given
   * collection
   *
   * @param id         Database ID of item to be retrieved
   * @param collection Database ID of collection to retrieve items from
   * @return List object containing the item with the given id from the given
   *         collection
   * @throws RepositoryException if a database error occurs
   */
  public List<Map<String, Object>> getItem(String id, String collection) {
    logger.debug("Fetching item with ID: {} from collection: {}", id, collection);
    try {
      String sql = "SELECT pgstac.get_item('" + id + "', '" + collection + "');";
      List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
      logger.debug(QUERY_RETURNED_RESULTS, results.size());
      return results;
    } catch (DataAccessException e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RepositoryException("Error fetching item with ID: " + id + " from collection: " + collection, e);
    }
  }

  /**
   * Method responsible for setting a DataLayerView in the database
   *
   * @param collectionId Database ID of the given collection
   * @throws RepositoryException if a database error occurs
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
      throw new RepositoryException("Error creating datalayer view for collection: " + collectionId, e);
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
    } catch (DataAccessException e) {
      logger.error("Error resetting Datalayer view: {}", e.getMessage(), e);
      throw new RepositoryException("Error resetting Datalayer view: " + e.getMessage(), e);
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
      logger.info("No data found in DataLayer view");
      return false;
    } catch (DataAccessException e) {
      logger.error("Error checking DataLayer view: {}", e.getMessage(), e);
      return false;
    }
  }

  /**
   * Method responsible for removing all items from the database
   *
   * @return String object to clarify if removal was successful
   * @throws RepositoryException if a database error occurs
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
      logger.error("Error removing all items: {}", e.getMessage(), e);
      throw new RepositoryException("Error removing all items", e);
    }
  }

  /**
   * Method responsible for removing all items of a given collection from the
   * database
   *
   * @param collectionId Database ID of the given collection
   * @return String object to clarify if removal was successful
   * @throws RepositoryException if a database error occurs
   */
  public String removeItemsFromCollection(String collectionId) {
    logger.debug("Removing all items from collection: {}", collectionId);
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
      throw new RepositoryException("Error removing items from collection: " + collectionId, e);
    }
  }

  /**
   * Method responsible for removing an item of a given collection from the
   * database
   *
   * @param itemId       Database ID of item to be removed
   * @param collectionId Database ID of collection that the item pertains to
   * @return String object to clarify if removal was successful
   * @throws RepositoryException if a database error occurs
   */
  public String removeItem(String itemId, String collectionId) {
    logger.debug("Removing item with ID: {} from collection: {}", itemId, collectionId);
    try {
      String sql = "SELECT delete_item('" + itemId + "', '" + collectionId + "');";

      jdbcTemplate.execute(sql);
      return "Successfully Removed Item";
    } catch (DataAccessException e) {
      logger.error("Error removing item: {}", e.getMessage(), e);
      throw new RepositoryException("Error removing item with ID: " + itemId + " from collection: " + collectionId, e);
    }
  }

  // BELOW ARE THE METHODS THAT WERE ADDED TO MANAGE GEOSERVER TIFFS

  /**
   * Inserts a new asset and marks it as not registered.
   *
   * @param itemId       ID of the item
   * @param collectionId ID of the collection
   * @param assetName    Name of the asset
   * @param layerUrl     URL of the layer
   */
  public void saveLayer(String itemId, String collectionId, String assetName, String layerUrl, int min, int max) {
    // Ensure the collection exists
    String insertCollection = """
            INSERT INTO TIFF_Collections (collection_id)
            VALUES (?)
            ON CONFLICT (collection_id) DO NOTHING;
        """;
    jdbcTemplate.update(insertCollection, collectionId);

    // Ensure the item exists
    String insertItem = """
            INSERT INTO TIFF_Items (item_id, collection_id)
            VALUES (?, ?)
            ON CONFLICT (item_id) DO NOTHING;
        """;
    jdbcTemplate.update(insertItem, itemId, collectionId);

    // Insert asset with default is_registered = FALSE
    String insertAsset = """
            INSERT INTO TIFF_Assets (item_id, asset_name, layer_url, is_registered, min, max)
            VALUES (?, ?, ?, FALSE, ?, ?)
            ON CONFLICT (item_id, asset_name) DO NOTHING;
        """;
    jdbcTemplate.update(insertAsset, itemId, assetName, layerUrl, min, max);
  }

  /**
   * Fetches all assets for a given item.
   *
   * @param itemId ID of the item
   * @return List of assets
   */
  public List<Map<String, Object>> getLoadedLayers(String itemId) {
    String sql = """
            SELECT a.id AS asset_id, a.asset_name, a.layer_url, a.is_registered, a.min, a.max,
                   i.item_id, i.collection_id
            FROM TIFF_Assets a
            JOIN TIFF_Items i ON a.item_id = i.item_id
            WHERE i.item_id = ?
        """;
    return jdbcTemplate.queryForList(sql, itemId);
  }

  /**
   * Clears all assets and items from the database.
   */
  public void clearLayers() {
    jdbcTemplate.update("DELETE FROM TIFF_Assets");
    jdbcTemplate.update("DELETE FROM TIFF_Items");
    jdbcTemplate.update("DELETE FROM TIFF_Collections");
  }

  /**
   * Fetches all items and their assets.
   *
   * @return List of item-asset mappings
   */
  public List<Map<String, Object>> getItemsWithAssets() {
    String sql = """
            SELECT i.item_id, a.asset_name, a.layer_url, a.is_registered
            FROM TIFF_Items i
            JOIN TIFF_Assets a ON i.item_id = a.item_id
        """;
    return jdbcTemplate.queryForList(sql);
  }

  /**
   * Deletes a specific asset from an item.
   *
   * @param assetName Name of the asset
   * @param itemId    ID of the item
   */
  public void deleteItemAssetLayer(String assetName, String itemId) {
    String sql = "DELETE FROM TIFF_Assets WHERE asset_name = ? AND item_id = ?";
    jdbcTemplate.update(sql, assetName, itemId);
  }

  /**
   * Marks an asset as registered in GeoServer.
   *
   * @param itemId    ID of the item
   * @param assetName Name of the asset
   */
  public void markAssetAsRegistered(String itemId, String assetName) {
    String sql = "UPDATE TIFF_Assets SET is_registered = TRUE WHERE item_id = ? AND asset_name = ?";
    jdbcTemplate.update(sql, itemId, assetName);
  }

  /**
   * Marks an asset as unregistered in GeoServer.
   *
   * @param itemId    ID of the item
   * @param assetName Name of the asset
   */
  public void markAssetAsUnregistered(String itemId, String assetName) {
    String sql = "UPDATE TIFF_Assets SET is_registered = FALSE WHERE item_id = ? AND asset_name = ?";
    jdbcTemplate.update(sql, itemId, assetName);
  }

  /**
   * Deletes an item and cascades its assets.
   *
   * @param itemId ID of the item
   */
  public void deleteItem(String itemId) {
    String sql = "DELETE FROM TIFF_Items WHERE item_id = ?";
    jdbcTemplate.update(sql, itemId);
  }

  /**
   * Fetches all assets that are currently marked as registered in GeoServer.
   *
   * @return List of registered assets
   */
  public List<Map<String, Object>> getLoadedLayers() {
    String sql = """
            SELECT a.id AS asset_id, a.asset_name, a.layer_url, a.is_registered, a.min, a.max,
                   i.item_id, i.collection_id
            FROM TIFF_Assets a
            JOIN TIFF_Items i ON a.item_id = i.item_id
            WHERE a.is_registered = TRUE
        """;
    return jdbcTemplate.queryForList(sql);
  }

}
