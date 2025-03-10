package wildfire.visualization.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import wildfire.visualization.backend.controller.ConfigController;
import wildfire.visualization.backend.helper.UtilHelper;
import wildfire.visualization.backend.repository.StacRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;


/**
 * The service responsible for the business logic of data retrieval from the pgSTAC database
 */
@Service
public class DataService {
  private static final Logger logger = LoggerFactory.getLogger(DataService.class);

  @Autowired
  private StacRepository stacRepository;

  @Autowired
  private RestTemplate restTemplate;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private StacDataConverter stacDataConverter;

  @Autowired
  private ConfigController configController;

  private final Map<String, AtomicInteger> fetchProgress = new ConcurrentHashMap<>();


  /**
   * Method responsible for retrieving metadata from a collection
   *
   * @param collectionId The database id of the collection
   * @return A String object that represents the List of key value pairs from the given collection's metadata
   * @throws JsonProcessingException Exception thrown when there's an error in the JSON Processing
   */
  public String retrieveCollectionMetaData(String collectionId) throws JsonProcessingException {
    return objectMapper.writeValueAsString(stacRepository.queryCollectionMetaData(collectionId));
  }

  /**
   * Method responsible for fetching and saving items from a given collection
   *
   * @param collectionId The database id of the collection
   */
  @Async
  public void fetchAndSaveItems(String collectionId) {
    fetchProgress.put(collectionId, new AtomicInteger(0)); // Initialize progress

    ResponseEntity<Map<String, Object>> response = fetchData(collectionId);
    Map<String, Object> responseBody = response.getBody();

    if (responseBody != null && responseBody.containsKey("progress")) {
      int progress = ((Number) responseBody.get("progress")).intValue();
    } else {
      logger.error("Progress not found in response body for collection: {}", collectionId);
      fetchProgress.get(collectionId).set(-1); // Set error state
    }

    logger.info("Fetching completed for collection: {}", collectionId);
  }


  /**
   * Method responsible for retrieving the progress of a given collection
   *
   * @param collectionId The database id of the collection
   * @return An integer representing the progress of the given collection
   */
  public int getProgress(String collectionId) {
    return fetchProgress.getOrDefault(collectionId, new AtomicInteger(-1)).get();
  }

  /**
   * Overloaded method responsible for inserting a view when only provided with collectionID
   *
   * @param collectionId The database id of the collection
   */
  public void insertView(String collectionId) {
    insertView(collectionId, 50);
  }

  /**
   * Method responsible for inserting a view for a given collection. The thread sleep time can be set using sleepMillis
   *
   * @param collectionId The database id of the collection
   * @param sleepMillis The thread sleep amount in milliseconds
   */
  public void insertView(String collectionId, int sleepMillis) {
    stacRepository.setDatalayerView(collectionId);
    boolean check = false;
    int count = 0;

    while (!check && count < 50) {
      check = stacRepository.checkDatalayerView();
      count++;
      try {
        // Sleep to avoid overwhelming the database
        Thread.sleep(sleepMillis);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        logger.error("Thread interrupted while waiting for the view to be created", e);
        break;
      }
    }

    if (check) {
      logger.info("View successfully detected in database for collectionId: {}", collectionId);
    } else {
      logger.warn("View not found in database after 50 attempts for collectionId: {}", collectionId);
      throw new IllegalStateException("View could not be created for collectionId: " + collectionId);
    }
  }

  /**
   * Overloaded method responsible for resetting datalayer view
   */
  public void resetView() {
    resetView(50);
  }

  /**
  * Method responsible for resetting the Datalayer view. The thread sleep time can be set using sleepMillis.
  *
  * @param sleepMillis The thread sleep amount in milliseconds
  */
  public void resetView(int sleepMillis) {
    stacRepository.resetDatalayerView();
    boolean check = true;
    int count = 0;

    while (check && count < 50) {
        check = stacRepository.checkDatalayerView();
        count++;
        try {
            Thread.sleep(sleepMillis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("Thread interrupted while waiting for the view to be reset", e);
            break;
        }
    }

    if (!check) {
        logger.info("View successfully reset in database");
    } else {
        logger.warn("View was still in database after 50 attempts");
        throw new IllegalStateException("View could not be reset");
    }
  }

  /**
   * Method responsible for retrieving and saving of collections into our database from a given endpoint
   *
   * @param endpointUrl Endpoint that we will be retrieving collections from
   */
  public void fetchAndSaveCollections(String endpointUrl) {
    try {
      Map<String, Object> response = restTemplate.getForObject(endpointUrl, Map.class);
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

  /**
   * Retrieves all collections from the database, optionally filtered by a
   * bounding box (BBOX).
   * <p>
   * This method fetches collections from the repository, applies an optional BBOX
   * filter,
   * and restructures the data for easy consumption by clients.
   *
   * @param bbox An optional bounding box filter (minX, minY, maxX, maxY). If
   *             null, no filter is applied.
   * @return A list of collections, each containing keys: `key`, `id`, and `bbox`.
   * @throws RuntimeException If an error occurs while fetching collections.
   */
  public List<Map<String, Object>> getCollections(double[] bbox) {
    logger.debug("Fetching collections from database with bbox: {}",
      bbox != null ? Arrays.toString(bbox) : "No bbox");

    try {
      // Fetch collections from repository
      List<Map<String, Object>> collections = stacRepository.getAllCollections(bbox);
      logger.info("Successfully fetched {} collections.", collections.size());

      // Transform collections into a structured format
      return collections.stream()
        .map(collection -> Map.of(
          "key", collection.get("key") == null ? "" : collection.get("key"),
          "id", collection.get("id") == null ? "" : collection.get("id"),
          "bbox", collection.get("bbox") == null ? "[]" : collection.get("bbox")
        ))
        .collect(Collectors.toList());
    } catch (Exception e) {
      logger.error("Error fetching collections: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch collections: " + e.getMessage(), e);
    }
  }

  /**
   * @param endpointUrl Endpoint that must be verified to see if it contains any collections
   * @return A String object that clarifies whether collections were found or not
   */
  public String verifyCollections(String endpointUrl) {
    try {
      Map<String, Object> response = restTemplate.getForObject(endpointUrl, Map.class);
      List<Map<String, Object>> collections = (List<Map<String, Object>>) response.get("collections");
      if (collections == null || collections.isEmpty()) {
        throw new RuntimeException("No collections found at the provided URL");
      }
      return "Collections found";
    } catch (Exception e) {
      logger.error("Error checking collections: {}", e.getMessage(), e);
      throw new RuntimeException("Error checking collections: " + e.getMessage(), e);
    }
  }

  /**
   * Retrieves all collections from the database, sorted by name, optionally
   * filtered by a bounding box (BBOX).
   * <p>
   * This method queries collections ordered by their name (`id` field) and
   * restructures
   * the response for client consumption.
   *
   * @param bbox An optional bounding box filter (minX, minY, maxX, maxY). If
   *             null, no filter is applied.
   * @return A list of collections, each containing keys: `key`, `id`, and `bbox`.
   * @throws RuntimeException If an error occurs while fetching collections.
   */
  public List<Map<String, Object>> getCollectionsByName(double[] bbox) {
    logger.debug("Fetching collections from database sorted by name with bbox: {}",
      bbox != null ? Arrays.toString(bbox) : "No bbox");

    try {
      // Fetch collections sorted by name (id) from repository
      List<Map<String, Object>> collections = stacRepository.getAllCollectionsByName(bbox);

      logger.info("Successfully fetched {} collections sorted by name.", collections.size());

      // Transform collections into a structured format
      return collections.stream()
        .map(collection -> Map.of(
          "key", collection.get("key"),
          "id", collection.get("id"),
          "bbox", collection.getOrDefault("bbox", "[]") // Default empty bbox if null
        ))
        .collect(Collectors.toList());
    } catch (Exception e) {
      logger.error("Error fetching collections by Name: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch collections by Name: " + e.getMessage(), e);
    }
  }

  /**
   * Retrieves all collections from the database, sorted by date, optionally
   * filtered by a bounding box (BBOX).
   * <p>
   * This method queries collections ordered by their creation or modification
   * date and
   * restructures the response for client consumption.
   *
   * @param bbox An optional bounding box filter (minX, minY, maxX, maxY). If
   *             null, no filter is applied.
   * @return A list of collections, each containing keys: `key`, `id`, and `bbox`.
   * @throws RuntimeException If an error occurs while fetching collections.
   */
  public List<Map<String, Object>> getCollectionsByDate(double[] bbox) {
    logger.debug("Fetching collections from database sorted by date with bbox: {}",
      bbox != null ? Arrays.toString(bbox) : "No bbox");

    try {
      // Fetch collections sorted by date from repository
      List<Map<String, Object>> collections = stacRepository.getAllCollectionsByDate(bbox);

      logger.info("Successfully fetched {} collections sorted by date.", collections.size());

      // Transform collections into a structured format
      return collections.stream()
        .map(collection -> Map.of(
          "key", collection.get("key"),
          "id", collection.get("id"),
          "bbox", collection.getOrDefault("bbox", "[]") // Default empty bbox if null
        ))
        .collect(Collectors.toList());
    } catch (Exception e) {
      logger.error("Error fetching collections by Date: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch collections by Date: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for deleting all collections from the database
   */
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

  /**
   * Method responsible for deleting all items from the database.
   */
  public void deleteAllItems() {
    logger.info("Deleting all collections");
    try {
      stacRepository.deleteAllItems();
      logger.info("All collections deleted successfully");
    } catch (Exception e) {
      logger.error("Error deleting collections: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to delete collections: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for inserting a stringified JSON item into the database
   *
   * @param itemJson String object that contains the JSON of a pgSTAC item to be inserted into the database
   */
  public void insertItem(String itemJson) {
    logger.info("Inserting item into database");
    try {
      stacRepository.insertItem(itemJson);
    } catch (Exception e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch item: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for fetching and saving items from a given collection
   *
   * @param collectionId String object representing the id of the collection
   * @return A ResponseEntity object that contains a map of key-value pairs
   */
  public ResponseEntity<Map<String, Object>> fetchData(String collectionId) {
    Map<String, Object> responseBody = new HashMap<>();
    List<String> insertedTimestamps = new ArrayList<>();
    List<String> insertedItems = new ArrayList<>();
    int progress = 0;

    try {
      ResponseEntity<Map<String, Object>> responseEntity = configController.getConfig();
      Map<String, Object> config = responseEntity.getBody();
      assert config != null;

      // Fetch collection metadata from the database
      List<Map<String, Object>> collectionMetadata = stacRepository.queryCollectionMetaData(collectionId);
      if (collectionMetadata.isEmpty()) {
        throw new RuntimeException("No metadata found for collection: " + collectionId);
      }

      // Extract item count from metadata (if available)
      Integer itemCount = (Integer) collectionMetadata.get(0).get("item_count"); // May be missing

      // Extract start & end dates (for time-based progress if needed)
      LocalDateTime startDate = UtilHelper.extractTemporalStartFromDB(collectionMetadata);
      LocalDateTime endDate = UtilHelper.extractTemporalEndFromDB(collectionMetadata);
      if (startDate == null || endDate == null) {
        throw new RuntimeException("Failed to extract temporal extent for " + collectionId);
      }

      // Base items endpoint
      String endpointUrl = config.get("endpoint").toString() + "/" + collectionId + "/items";

      // Track fetched items & progress
      int totalFetched = 0;
      String nextUrl = endpointUrl;

      while (nextUrl != null) {
        // Fetch data
        Map<String, Object> response = restTemplate.getForObject(nextUrl, Map.class);
        assert response != null;

        // Extract items
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("features");
        if (items == null || items.isEmpty()) break;

        for (Map<String, Object> item : items) {
          item.put("collection_id", collectionId);
          String id = (String) item.get("id");

          if (!stacRepository.checkCollectionExists(id)) {
            String itemJson = objectMapper.writeValueAsString(item);
            stacRepository.insertItem(itemJson);
            insertedItems.add(id);
            insertedTimestamps.add(UtilHelper.extractTimestampISO(id)); // Convert ID to timestamp
            totalFetched++;
          }
        }

        // Determine progress calculation method
        if (itemCount != null && itemCount > 0) {
          // Use `item_count` if available
          progress = (int) Math.floor(((double) totalFetched / itemCount) * 100);
        } else {
          // Use timestamp-based progress if `item_count` is missing
          progress = (int) Math.floor(UtilHelper.computeProgressFromItems(items, endDate, startDate));
        }

        // Update progress in the database
        fetchProgress.put(collectionId, new AtomicInteger(progress));

        nextUrl = UtilHelper.extractNextUrl(response);
      }

      // Update progress when done
      fetchProgress.put(collectionId, new AtomicInteger(100));

      // Construct API response body
      responseBody.put("collectionId", collectionId);
      responseBody.put("totalFetched", totalFetched);
      responseBody.put("progress", progress);
      responseBody.put("insertedItems", insertedItems);
      responseBody.put("insertedTimestamps", insertedTimestamps);
      responseBody.put("nextPage", nextUrl);

      return ResponseEntity.ok(responseBody);

    } catch (Exception e) {
      responseBody.put("error", "Failed to fetch or save items: " + e.getMessage());
      return ResponseEntity.status(500).body(responseBody);
    }
  }

  public List<String> fetchItemsTimestamps() {
    logger.debug("Fetching item timestamps from database");
    try {
      return stacRepository.getItemsTimestamps();
    } catch (Exception e) {
      logger.error("Error fetching item timestamps: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch item timestamps: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for retrieving a single pgSTAC item from the database
   *
   * @param id String object representing the pgSTAC item's id
   * @return List object that contains the data of the given item
   */
  public List<Map<String, Object>> getItem(String id) {
    logger.info("Fetching item from database");
    try {
      return stacRepository.getItem(id);
    } catch (Exception e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch item: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for retrieving an item within a certain collection
   *
   * @param id String object representing the pgSTAC item's id
   * @param collection String object representing the pgSTAC collection's id
   * @return List object that contains the data of the given item relating to the given collection
   */
  public List<Map<String, Object>> getItem(String id, String collection) {
    logger.info("Fetching item from database");
    try {
      return stacRepository.getItem(id, collection);
    } catch (Exception e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch item: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for removing all items from the database
   *
   * @return String object clarifying whether the removal of all items from the database was successful
   */
  public String removeAllItems() {
    logger.info("Removing all items from database");
    try {
      return stacRepository.removeAllItems();
    } catch (Exception e) {
      logger.error("Error removing all items: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to remove all items: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for removing all items relating to a specific collection from the database
   *
   * @param collectionId String object representing the id of the given collection
   * @return String clarifying if the removal of the items from the given collection was successful
   */
  public String removeItemsFromCollection(String collectionId) {
    logger.info("Removing an item from database");
    try {
      return stacRepository.removeItemsFromCollection(collectionId);
    } catch (Exception e) {
      logger.error("Error removing item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to remove  item: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for removing a specific item from a specific collection
   *
   * @param itemId String object representing the id of the given item
   * @param collectionId String object representing the id of the given collection
   * @return String object clarifying if the removal of the item was successful
   */
  public String removeItem(String itemId, String collectionId) {
    logger.info("Removing an item from database");
    try {
      return stacRepository.removeItem(itemId, collectionId);
    } catch (Exception e) {
      logger.error("Error removing item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to remove item: " + e.getMessage(), e);
    }
  }

  /**
   * Method responsible for verifying if the user is connected to the internet
   *
   * @param endpointUrl String object representing the URL of a website to connect to in order to test whether user is online or not
   * @return String object clarifying if the application is online or offline
   */
  public String verifyInternetConnection(String endpointUrl) {
    logger.info("Verifying internet connection");
    try {
      restTemplate.getForObject(endpointUrl, String.class);
      logger.info("Internet connection established");
      return "Internet connection established";
    } catch (Exception e) {
      logger.info("No internet connection could be established");
      return "No internet connection could be established";
    }
  }
}
