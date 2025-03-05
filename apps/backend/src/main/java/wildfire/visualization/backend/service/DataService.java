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

  public String retrieveMetaData(String collectionId) throws JsonProcessingException {
    return objectMapper.writeValueAsString(stacRepository.queryMetaData(collectionId));
  }

  public void insertView(String collectionId) {
    insertView(collectionId, 50);
  }

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
      List<Map<String, Object>> collections = stacRepository.getAllCollections(bbox);
      logger.info("Successfully fetched {} collections.", collections.size());

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

  public void insertItem(String itemJson) {
    logger.info("Inserting item into database");
    try {
      stacRepository.insertItem(itemJson);
    } catch (Exception e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch item: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getAllItems(String collectionId) {
    logger.info("Fetching item from database");
    try {
      return stacRepository.getAllItems(collectionId);
    } catch (Exception e) {
      logger.error("Error fetching items: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch items: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getItem(String id) {
    logger.info("Fetching item from database");
    try {
      return stacRepository.getItem(id);
    } catch (Exception e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch item: " + e.getMessage(), e);
    }
  }

  public List<Map<String, Object>> getItem(String id, String collection) {
    logger.info("Fetching item from database");
    try {
      return stacRepository.getItem(id, collection);
    } catch (Exception e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch item: " + e.getMessage(), e);
    }
  }

  public String removeAllItems() {
    logger.info("Removing all items from database");
    try {
      return stacRepository.removeAllItems();
    } catch (Exception e) {
      logger.error("Error removing all items: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to remove all items: " + e.getMessage(), e);
    }
  }

  public String removeItemsFromCollection(String collectionId) {
    logger.info("Removing an item from database");
    try {
      return stacRepository.removeItemsFromCollection(collectionId);
    } catch (Exception e) {
      logger.error("Error removing item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to remove  item: " + e.getMessage(), e);
    }
  }

  public String removeItem(String itemId, String collectionId) {
    logger.info("Removing an item from database");
    try {
      return stacRepository.removeItem(itemId, collectionId);
    } catch (Exception e) {
      logger.error("Error removing item: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to remove item: " + e.getMessage(), e);
    }
  }

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
