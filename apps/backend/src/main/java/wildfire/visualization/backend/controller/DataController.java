package wildfire.visualization.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.core.JsonProcessingException;

import wildfire.visualization.backend.service.DataService;
import wildfire.visualization.backend.exception.DataException;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Controller class responsible for API Endpoints that interact with fetching,
 * inserting and removing data from pgSTAC database
 */
@RestController
public class DataController {
  private static final Logger logger = LoggerFactory.getLogger(DataController.class);

  private final DataService dataService;

  public DataController(DataService dataService) {
    this.dataService = dataService;
  }

  /**
   * Parses a bounding box (BBOX) string from a request parameter.
   * The BBOX format is "minX,minY,maxX,maxY".
   *
   * @param bboxStr The bounding box string to be parsed.
   * @return A double array representing the bounding box values, or null if
   *         parsing fails.
   * @throws DataException if the bounding box format is invalid
   */
  private double[] parseBbox(String bboxStr) {
    if (bboxStr == null) {
      return null;
    }

    bboxStr = URLDecoder.decode(bboxStr, StandardCharsets.UTF_8);
    logger.debug("Parsing BBOX input...");

    String[] bboxParts = bboxStr.split(",");
    if (bboxParts.length != 4) {
      logger.warn("Invalid BBOX format: Expected 4 values but received {}", bboxParts.length);
      throw new DataException("Invalid BBOX format: Expected 4 values");
    }

    try {
      return Arrays.stream(bboxParts).mapToDouble(Double::parseDouble).toArray();
    } catch (NumberFormatException e) {
      logger.warn("Error parsing BBOX: Invalid number format");
      throw new DataException("Error parsing BBOX: Invalid number format", e);
    }
  }

  /**
   * Endpoint responsible for retrieving MetaData from a collection
   *
   * @param collectionId Database ID of the given collection
   * @return ResponseEntity object containing the MetaData of the collection
   * @throws JsonProcessingException if there's an error processing JSON
   */
  @GetMapping("/api/metadata/{id}")
  public ResponseEntity<String> getMetaData(@PathVariable("id") String collectionId) throws JsonProcessingException {
    logger.info("Received request to /api/metadata");
    String result = dataService.retrieveCollectionMetaData(collectionId);
    logger.debug("Successfully processed MetaData");
    return ResponseEntity.ok(result);
  }

  /**
   * Endpoint responsible for fetching pgSTAC collections from a given endpoint
   *
   * @param endpointUrl String object containing the URL to the collections to be
   *                    retrieved
   * @return ResponseEntity object with a status code of 200 and a message
   *         indicating the the collections were fetched and saved successfully
   */
  @GetMapping("/api/fetch-collections")
  public ResponseEntity<String> fetchCollections(@RequestParam String endpointUrl) {
    logger.info("Fetching collections from URL: {}", endpointUrl);

    try {
      URI uri = new URI(endpointUrl);
      uri.toURL();
    } catch (Exception e) {
      throw new DataException("Invalid URL provided: " + endpointUrl, e);
    }

    dataService.fetchAndSaveCollections(endpointUrl);
    return ResponseEntity.ok("Collections fetched and saved successfully");
  }

  /**
   * Fetches collections from the database, optionally filtering by a bounding box
   * (BBOX).
   *
   * @param bboxStr The bounding box string in "minX,minY,maxX,maxY" format
   *                (optional).
   * @return A ResponseEntity containing a list of collections or an error
   *         message.
   */
  @GetMapping("/api/get-collections")
  public ResponseEntity<List<Map<String, Object>>> getCollections(
      @RequestParam(value = "bbox", required = false) String bboxStr) {
    logger.info("Processing request to fetch collections.");

    double[] bbox = parseBbox(bboxStr);
    List<Map<String, Object>> collections = dataService.getCollections(bbox);
    return ResponseEntity.ok(collections);
  }

  /**
   * Endpoint responsible for fetching items from a given collection
   *
   * @param collectionId Database ID for the collection in which to retrieve items
   *                     from
   * @return ResponseEntity object containing a list of all the items associated
   *         with that collection
   */
  @GetMapping("/api/fetch-collections-items/{collectionId}")
  public ResponseEntity<String> fetchItems(@PathVariable("collectionId") String collectionId) {
    logger.info("Received request to fetch items asynchronously for collection: {}", collectionId);
    try {
      // Run the fetching task asynchronously
      CompletableFuture.runAsync(() -> dataService.fetchAndSaveItems(collectionId));
      // Return immediate response to frontend
      return ResponseEntity.ok("Fetching started in the background. Check progress separately.");
    } catch (DataException e) {
      logger.error("Error fetching items for collection: {}", collectionId, e);
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
  }

  /**
   * Endpoint responsible for fetching items from a given collection
   *
   * @param collectionId Database ID for the collection in which to retrieve items
   *                     from
   * @return ResponseEntity object containing a list of all the items associated
   *         with that collection
   */
  @GetMapping("/api/fetch-progress/{collectionId}")
  public ResponseEntity<Map<String, Object>> getFetchProgress(@PathVariable String collectionId) {
    int progress = dataService.getProgress(collectionId);
    Map<String, Object> response = new HashMap<>();
    response.put("collectionId", collectionId);
    response.put("progress", progress);

    return ResponseEntity.ok(response);
  }

  /**
   * Endpoint responsible for fetching timestamps of items.
   *
   * @return ResponseEntity containing a list of item timestamps or an error
   *         message.
   */
  @GetMapping("/api/fetch-items-timestamps")
  public ResponseEntity<List<String>> fetchItemsTimestamps() {
    logger.info("Received request to fetch items' timestamps");
    List<String> timestamps = dataService.fetchItemsTimestamps();
    logger.debug("Successfully fetched items's timestamps");
    return ResponseEntity.ok(timestamps);
  }

  /**
   * Endpoint responsible for retrieving an item given a specific id and
   * collection id
   *
   * @param itemId       Database ID of the given item to be retrieved
   * @param collectionId Database ID of the given collection
   * @return ResponseEntity object containing the specified item
   */
  @GetMapping("/api/get-item/{id}/{collection}")
  public ResponseEntity<List<Map<String, Object>>> getItem(@PathVariable("id") String itemId,
      @PathVariable("collection") String collectionId) {
    logger.info("Received request to get item");
    List<Map<String, Object>> item = dataService.getItem(itemId, collectionId);
    logger.debug("Successfully fetched item");
    return ResponseEntity.ok(item);
  }

  /**
   * Endpoint responsible for removing all items from the database
   *
   * @return ResponseEntity object containing a String object indicating if the
   *         removal was successful
   */
  @DeleteMapping("/api/remove-all-items")
  public ResponseEntity<String> removeAllItems() {
    logger.info("Received request to remove all items");
    String result = dataService.removeAllItems();
    logger.debug("Successfully removed all items");
    return ResponseEntity.ok(result);
  }

  /**
   * Endpoint responsible for removing all items from a specified collection from
   * the database
   *
   * @param collectionId Database ID for the collection
   * @return ResponseEntity object containing a String object indicating if the
   *         removal was successful
   */
  @DeleteMapping("/api/remove-items-from-collection/{collectionId}")
  public ResponseEntity<String> removeItemsFromCollection(@PathVariable("collectionId") String collectionId) {
    logger.info("Received request to remove all items");
    String result = dataService.removeItemsFromCollection(collectionId);
    logger.debug("Successfully removed all items");
    return ResponseEntity.ok(result);
  }

  /**
   * Endpoint responsible for removing a single item with a given item id and
   * collection id
   *
   * @param itemId       Database ID of item to be removed
   * @param collectionId Database ID of given collection
   * @return ResponseEntity object containing a String object indicating if the
   *         removal was successful
   */
  @DeleteMapping("/api/remove-item/{id}/{collection}")
  public ResponseEntity<String> removeItem(@PathVariable("id") String itemId,
      @PathVariable("collection") String collectionId) {
    logger.info("Received request to remove all items");
    String result = dataService.removeItem(itemId, collectionId);
    logger.debug("Successfully removed all items");
    return ResponseEntity.ok(result);
  }

  /**
   * Endpoint responsible for verifying if a given URL contains any pgSTAC
   * collections
   *
   * @param endpointUrl String object representing the URL to be verified
   * @return ResponseEntity object containing a String object indicating if there
   *         are any collections at the given URL
   */
  @GetMapping("/api/verify-collections")
  public ResponseEntity<String> verifyIfEndpointHasCollections(@RequestParam String endpointUrl) {
    logger.info("Checking if there exist at least one collection from Endpoint URL: {}", endpointUrl);
    String result = dataService.verifyCollections(endpointUrl);
    return ResponseEntity.ok(result);
  }

  /**
   * Endpoint responsible for removing all collections from the database
   *
   * @return ResponseEntity object containing a String object indicating if the
   *         removal was successful
   */
  @GetMapping("/api/reset-collections")
  public ResponseEntity<String> resetCollections() {
    logger.info("Received request to reset collections");
    dataService.deleteAllCollections();
    return ResponseEntity.ok("Collections deleted successfully");
  }

  /**
   * Endpoint responsible for removing all items from the database.
   *
   * @return ResponseEntity object containing a String object indicating if the
   *         removal was successful.
   */
  @GetMapping("/api/reset-items")
  public ResponseEntity<String> resetItems() {
    logger.info("Received request to reset items");
    dataService.deleteAllItems();
    return ResponseEntity.ok("Items deleted successfully");
  }

  /**
   * Fetches collections sorted by name, optionally filtering by a bounding box
   * (BBOX).
   *
   * @param bboxStr The bounding box string in "minX,minY,maxX,maxY" format
   *                (optional).
   * @return A ResponseEntity containing a list of collections sorted by name.
   */
  @GetMapping("/api/get-collections-by-name")
  public ResponseEntity<List<Map<String, Object>>> getCollectionsByName(
      @RequestParam(value = "bbox", required = false) String bboxStr) {
    logger.info("Processing request to fetch collections sorted by name.");

    double[] bbox = parseBbox(bboxStr);
    List<Map<String, Object>> collections = dataService.getCollectionsByName(bbox);
    return ResponseEntity.ok(collections);
  }

  /**
   * Fetches collections sorted by date, optionally filtering by a bounding box
   * (BBOX).
   *
   * @param bboxStr The bounding box string in "minX,minY,maxX,maxY" format
   *                (optional).
   * @return A ResponseEntity containing a list of collections sorted by date.
   */
  @GetMapping("/api/get-collections-by-date")
  public ResponseEntity<List<Map<String, Object>>> getCollectionsByDate(
      @RequestParam(value = "bbox", required = false) String bboxStr) {
    logger.info("Processing request to fetch collections sorted by date.");

    double[] bbox = parseBbox(bboxStr);
    List<Map<String, Object>> collections = dataService.getCollectionsByDate(bbox);
    return ResponseEntity.ok(collections);
  }

  /**
   * Endpoint responsible for inserting a view using a given collectionId
   *
   * @param collectionId Database ID of given collection
   * @return ResponseEntity containing a String object indicating if the insertion
   *         was successful
   */
  @GetMapping("/api/set-datalayer-geometry/{id}")
  public ResponseEntity<String> insertView(@PathVariable("id") String collectionId) {
    logger.info("Received request to /api/set-datalayer-geometry");
    dataService.insertView(collectionId);
    logger.info("Successfully processed custom collection");
    return ResponseEntity.ok("Successfully inserted view");
  }

  /**
   * Endpoint responsible for resetting the Datalayer view
   *
   * @return ResponseEntity containing a String object indicating if the reset was
   *         successful
   */
  @GetMapping("/api/reset-view")
  public ResponseEntity<String> resetView() {
    logger.info("Received request to /api/reset-view");
    dataService.resetView();
    logger.info("Successfully processed resetting view");
    return ResponseEntity.ok("View reset successfully");
  }

  /**
   * Endpoint responsible for checking if the user is connected to the internet
   *
   * @param endpointUrl String object representing a URL that the endpoint will
   *                    attempt to connect to
   * @return ResponseEntity containg a String object indicating if the user is
   *         connected to the internet
   */
  @GetMapping("/api/verify-internet-connection")
  public ResponseEntity<String> verifyInternetConnection(@RequestParam String endpointUrl) {
    logger.info("Checking if there is an internet connection: {}", endpointUrl);
    String result = dataService.verifyInternetConnection(endpointUrl);
    return ResponseEntity.ok(result);
  }
}