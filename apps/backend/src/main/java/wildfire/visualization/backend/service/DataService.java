package wildfire.visualization.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import wildfire.visualization.backend.repository.StacRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
          "key", collection.get("key"),
          "id", collection.get("id"),
          "bbox", collection.getOrDefault("bbox", "[]") // Default empty bbox if null
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
   * Method responsible for retrieving all pgSTAC items relating to a certain collection
   *
   * @param collectionId String object with the value of the given collection's id
   * @return A List object that contains all the items related to the given collection
   */
  public List<Map<String, Object>> getAllItems(String collectionId) {
    logger.info("Fetching item from database");
    try {
      return stacRepository.getAllItems(collectionId);
    } catch (Exception e) {
      logger.error("Error fetching items: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch items: " + e.getMessage(), e);
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
