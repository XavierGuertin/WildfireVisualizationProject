package com.example.backend.controller;

import com.example.backend.service.DataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

@RestController
public class DataController {
  private static final Logger logger = LoggerFactory.getLogger(DataController.class);

  @Autowired
  private DataService dataService;

  @GetMapping("/api/data")
  public ResponseEntity<String> getData() {
    logger.info("Received request to /api/data");
    try {
      ClassPathResource resource = new ClassPathResource("synthetic_wildfire_collection.json");
      String jsonData = Files.readString(resource.getFile().toPath());
      logger.debug("Successfully read JSON file");
      return ResponseEntity.ok(jsonData);
    } catch (IOException e) {
      logger.error("Error reading JSON file: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body("Error reading file: " + e.getMessage());
    }
  }

  @GetMapping("/api/metadata/{id}")
  public ResponseEntity<String> getMetaData(@PathVariable("id") String collectionId) {
    logger.info("Received request to /api/metadata");
    try {
      String result = dataService.retrieveMetaData(collectionId);
      logger.debug("Successfully processed MetaData");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error in MetaData endpoint: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body("Error processing MetaData: " + e.getMessage());
    }
  }

  @GetMapping("/api/fetch-collections")
  public ResponseEntity<String> fetchCollections(@RequestParam String endpointUrl) {
    logger.info("Fetching collections from URL: {}", endpointUrl);

    try {
      URI uri = new URI(endpointUrl);
      uri.toURL();
    } catch (Exception e) {
      logger.error("Invalid URL provided: {}", endpointUrl);
      return ResponseEntity.badRequest().body("Invalid URL provided: " + endpointUrl);
    }

    try {
      dataService.fetchAndSaveCollections(endpointUrl);
      return ResponseEntity.ok("Collections fetched and saved successfully");
    } catch (Exception e) {
      logger.error("Error fetching collections: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body("Error fetching collections: " + e.getMessage());
    }
  }

  @GetMapping("/api/get-collections")
  public ResponseEntity<List<Map<String, Object>>> getCollections() {
    logger.info("Received request to get collections");
    try {
      List<Map<String, Object>> collections = dataService.getCollections();
      logger.debug("Successfully fetched collections");
      return ResponseEntity.ok(collections);
    } catch (Exception e) {
      logger.error("Error fetching collections: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @PostMapping("/api/insert-mock-items")
  public ResponseEntity<String> insertMockItems(){
    //This whole endpoint and data is temporary until the CRIM get back to us with the data we need to complete the application
    String itemListJson = "[\n" +
      "      {\n" +
      "        \"type\": \"Feature\",\n" +
      "        \"stac_version\": \"1.0.0\",\n" +
      "        \"stac_extensions\": [\"https://stac-extensions.github.io/projection/v1.0.0/schema.json\"],\n" +
      "        \"id\": \"image_2025-01-01\",\n" +
      "        \"collection\": \"EuroSAT-subset-train\",\n" +
      "        \"geometry\": {\n" +
      "          \"type\": \"Polygon\",\n" +
      "          \"coordinates\": [\n" +
      "            [\n" +
      "              [-102.0, 40.0],\n" +
      "              [-101.0, 40.0],\n" +
      "              [-101.0, 41.0],\n" +
      "              [-102.0, 41.0],\n" +
      "              [-102.0, 40.0]\n" +
      "            ]\n" +
      "          ]\n" +
      "        },\n" +
      "        \"bbox\": [-102.0, 40.0, -101.0, 41.0],\n" +
      "        \"properties\": {\n" +
      "          \"datetime\": \"2025-01-01T10:00:00Z\",\n" +
      "          \"platform\": \"satellite-1\",\n" +
      "          \"instruments\": [\"camera\"],\n" +
      "          \"cloud_cover\": 15.0\n" +
      "        },\n" +
      "        \"assets\": {\n" +
      "          \"visual\": {\n" +
      "            \"href\": \"https://example.com/2025-01-01/visual.tif\",\n" +
      "            \"type\": \"image/tiff; application=geotiff\",\n" +
      "            \"title\": \"Visual Band\"\n" +
      "          }\n" +
      "        }\n" +
      "      },\n" +
      "      {\n" +
      "        \"type\": \"Feature\",\n" +
      "        \"stac_version\": \"1.0.0\",\n" +
      "        \"stac_extensions\": [\"https://stac-extensions.github.io/projection/v1.0.0/schema.json\"],\n" +
      "        \"id\": \"image_2025-02-01\",\n" +
      "        \"collection\": \"EuroSAT-subset-train\",\n" +
      "        \"geometry\": {\n" +
      "          \"type\": \"Polygon\",\n" +
      "          \"coordinates\": [\n" +
      "            [\n" +
      "              [-102.0, 40.0],\n" +
      "              [-101.0, 40.0],\n" +
      "              [-101.0, 41.0],\n" +
      "              [-102.0, 41.0],\n" +
      "              [-102.0, 40.0]\n" +
      "            ]\n" +
      "          ]\n" +
      "        },\n" +
      "        \"bbox\": [-102.0, 40.0, -101.0, 41.0],\n" +
      "        \"properties\": {\n" +
      "          \"datetime\": \"2025-02-01T10:00:00Z\",\n" +
      "          \"platform\": \"satellite-1\",\n" +
      "          \"instruments\": [\"camera\"],\n" +
      "          \"cloud_cover\": 10.0\n" +
      "        },\n" +
      "        \"assets\": {\n" +
      "          \"visual\": {\n" +
      "            \"href\": \"https://example.com/2025-02-01/visual.tif\",\n" +
      "            \"type\": \"image/tiff; application=geotiff\",\n" +
      "            \"title\": \"Visual Band\"\n" +
      "          }\n" +
      "        }\n" +
      "      },\n" +
      "      {\n" +
      "        \"type\": \"Feature\",\n" +
      "        \"stac_version\": \"1.0.0\",\n" +
      "        \"stac_extensions\": [\"https://stac-extensions.github.io/projection/v1.0.0/schema.json\"],\n" +
      "        \"id\": \"image_2025-03-01\",\n" +
      "        \"collection\": \"EuroSAT-subset-train\",\n" +
      "        \"geometry\": {\n" +
      "          \"type\": \"Polygon\",\n" +
      "          \"coordinates\": [\n" +
      "            [\n" +
      "              [-102.0, 40.0],\n" +
      "              [-101.0, 40.0],\n" +
      "              [-101.0, 41.0],\n" +
      "              [-102.0, 41.0],\n" +
      "              [-102.0, 40.0]\n" +
      "            ]\n" +
      "          ]\n" +
      "        },\n" +
      "        \"bbox\": [-102.0, 40.0, -101.0, 41.0],\n" +
      "        \"properties\": {\n" +
      "          \"datetime\": \"2025-03-01T10:00:00Z\",\n" +
      "          \"platform\": \"satellite-1\",\n" +
      "          \"instruments\": [\"camera\"],\n" +
      "          \"cloud_cover\": 8.0\n" +
      "        },\n" +
      "        \"assets\": {\n" +
      "          \"visual\": {\n" +
      "            \"href\": \"https://example.com/2025-03-01/visual.tif\",\n" +
      "            \"type\": \"image/tiff; application=geotiff\",\n" +
      "            \"title\": \"Visual Band\"\n" +
      "          }\n" +
      "        }\n" +
      "      },\n" +
      "      {\n" +
      "        \"type\": \"Feature\",\n" +
      "        \"stac_version\": \"1.0.0\",\n" +
      "        \"stac_extensions\": [\"https://stac-extensions.github.io/projection/v1.0.0/schema.json\"],\n" +
      "        \"id\": \"image_2025-04-01\",\n" +
      "        \"collection\": \"EuroSAT-subset-train\",\n" +
      "        \"geometry\": {\n" +
      "          \"type\": \"Polygon\",\n" +
      "          \"coordinates\": [\n" +
      "            [\n" +
      "              [-102.0, 40.0],\n" +
      "              [-101.0, 40.0],\n" +
      "              [-101.0, 41.0],\n" +
      "              [-102.0, 41.0],\n" +
      "              [-102.0, 40.0]\n" +
      "            ]\n" +
      "          ]\n" +
      "        },\n" +
      "        \"bbox\": [-102.0, 40.0, -101.0, 41.0],\n" +
      "        \"properties\": {\n" +
      "          \"datetime\": \"2025-04-01T10:00:00Z\",\n" +
      "          \"platform\": \"satellite-1\",\n" +
      "          \"instruments\": [\"camera\"],\n" +
      "          \"cloud_cover\": 5.0\n" +
      "        },\n" +
      "        \"assets\": {\n" +
      "          \"visual\": {\n" +
      "            \"href\": \"https://example.com/2025-04-01/visual.tif\",\n" +
      "            \"type\": \"image/tiff; application=geotiff\",\n" +
      "            \"title\": \"Visual Band\"\n" +
      "          }\n" +
      "        }\n" +
      "      },\n" +
      "      {\n" +
      "        \"type\": \"Feature\",\n" +
      "        \"stac_version\": \"1.0.0\",\n" +
      "        \"stac_extensions\": [\"https://stac-extensions.github.io/projection/v1.0.0/schema.json\"],\n" +
      "        \"id\": \"image_2025-05-01\",\n" +
      "        \"collection\": \"EuroSAT-subset-train\",\n" +
      "        \"geometry\": {\n" +
      "          \"type\": \"Polygon\",\n" +
      "          \"coordinates\": [\n" +
      "            [\n" +
      "              [-102.0, 40.0],\n" +
      "              [-101.0, 40.0],\n" +
      "              [-101.0, 41.0],\n" +
      "              [-102.0, 41.0],\n" +
      "              [-102.0, 40.0]\n" +
      "            ]\n" +
      "          ]\n" +
      "        },\n" +
      "        \"bbox\": [-102.0, 40.0, -101.0, 41.0],\n" +
      "        \"properties\": {\n" +
      "          \"datetime\": \"2025-05-01T10:00:00Z\",\n" +
      "          \"platform\": \"satellite-1\",\n" +
      "          \"instruments\": [\"camera\"],\n" +
      "          \"cloud_cover\": 12.0\n" +
      "        },\n" +
      "        \"assets\": {\n" +
      "          \"visual\": {\n" +
      "            \"href\": \"https://example.com/2025-05-01/visual.tif\",\n" +
      "            \"type\": \"image/tiff; application=geotiff\",\n" +
      "            \"title\": \"Visual Band\"\n" +
      "          }\n" +
      "        }\n" +
      "      },\n" +
      "      {\n" +
      "        \"type\": \"Feature\",\n" +
      "        \"stac_version\": \"1.0.0\",\n" +
      "        \"stac_extensions\": [\"https://stac-extensions.github.io/projection/v1.0.0/schema.json\"],\n" +
      "        \"id\": \"image_2025-06-01\",\n" +
      "        \"collection\": \"EuroSAT-subset-train\",\n" +
      "        \"geometry\": {\n" +
      "          \"type\": \"Polygon\",\n" +
      "          \"coordinates\": [\n" +
      "            [\n" +
      "              [-102.0, 40.0],\n" +
      "              [-101.0, 40.0],\n" +
      "              [-101.0, 41.0],\n" +
      "              [-102.0, 41.0],\n" +
      "              [-102.0, 40.0]\n" +
      "            ]\n" +
      "          ]\n" +
      "        },\n" +
      "        \"bbox\": [-102.0, 40.0, -101.0, 41.0],\n" +
      "        \"properties\": {\n" +
      "          \"datetime\": \"2025-06-01T10:00:00Z\",\n" +
      "          \"platform\": \"satellite-1\",\n" +
      "          \"instruments\": [\"camera\"],\n" +
      "          \"cloud_cover\": 9.0\n" +
      "        },\n" +
      "        \"assets\": {\n" +
      "          \"visual\": {\n" +
      "            \"href\": \"https://example.com/2025-06-01/visual.tif\",\n" +
      "            \"type\": \"image/tiff; application=geotiff\",\n" +
      "            \"title\": \"Visual Band\"\n" +
      "          }\n" +
      "        }\n" +
      "      },\n" +
      "      {\n" +
      "        \"type\": \"Feature\",\n" +
      "        \"stac_version\": \"1.0.0\",\n" +
      "        \"stac_extensions\": [\"https://stac-extensions.github.io/projection/v1.0.0/schema.json\"],\n" +
      "        \"id\": \"image_2025-06-05\",\n" +
      "        \"collection\": \"EuroSAT-subset-validate\",\n" +
      "        \"geometry\": {\n" +
      "          \"type\": \"Polygon\",\n" +
      "          \"coordinates\": [\n" +
      "            [\n" +
      "              [-102.0, 40.0],\n" +
      "              [-101.0, 40.0],\n" +
      "              [-101.0, 41.0],\n" +
      "              [-102.0, 41.0],\n" +
      "              [-102.0, 40.0]\n" +
      "            ]\n" +
      "          ]\n" +
      "        },\n" +
      "        \"bbox\": [-102.0, 40.0, -101.0, 41.0],\n" +
      "        \"properties\": {\n" +
      "          \"datetime\": \"2025-06-01T10:00:00Z\",\n" +
      "          \"platform\": \"satellite-1\",\n" +
      "          \"instruments\": [\"camera\"],\n" +
      "          \"cloud_cover\": 9.0\n" +
      "        },\n" +
      "        \"assets\": {\n" +
      "          \"visual\": {\n" +
      "            \"href\": \"https://example.com/2025-06-01/visual.tif\",\n" +
      "            \"type\": \"image/tiff; application=geotiff\",\n" +
      "            \"title\": \"Visual Band\"\n" +
      "          }\n" +
      "        }\n" +
      "      }\n" +
      "    ]";
    try{
      dataService.insertMockItems(itemListJson);
      return ResponseEntity.ok("Successful Insertion of Mock Data!");
    }
    catch (Exception e){
      logger.error("Error creating item: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("/api/get-all-items/{collectionId}")
  public ResponseEntity<List<Map<String, Object>>> fetchItems(@PathVariable("collectionId") String collectionId) {
    logger.info("Received request to fetch items");
    try {
      List<Map<String, Object>> items = dataService.getAllItems(collectionId);
      logger.debug("Successfully fetched items");
      return ResponseEntity.ok(items);
    } catch (Exception e) {
      logger.error("Error fetching items: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("/api/get-item/{id}/{collection}")
  public ResponseEntity<List<Map<String, Object>>> getItem(@PathVariable("id") String itemId, @PathVariable("collection") String collectionId) {
    logger.info("Received request to get item");
    try {
      List<Map<String, Object>> item = dataService.getItem(itemId, collectionId);
      logger.debug("Successfully fetched item");
      return ResponseEntity.ok(item);
    } catch (Exception e) {
      logger.error("Error fetching item: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @DeleteMapping("/api/remove-all-items")
  public ResponseEntity<String> removeAllItems(){
    logger.info("Received request to remove all items");
    try {
      String result = dataService.removeAllItems();
      logger.debug("Successfully removed all items");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error removing all items: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @DeleteMapping("/api/remove-items-from-collection/{collectionId}")
  public ResponseEntity<String> removeItemsFromCollection(@PathVariable("collectionId") String collectionId){
    logger.info("Received request to remove all items");
    try {
      String result = dataService.removeItemsFromCollection(collectionId);
      logger.debug("Successfully removed all items");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error removing all items: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @DeleteMapping("/api/remove-item/{id}/{collection}")
  public ResponseEntity<String> removeItem(@PathVariable("id") String itemId, @PathVariable("collection")String collectionId){
    logger.info("Received request to remove all items");
    try {
      String result = dataService.removeItem(itemId, collectionId);
      logger.debug("Successfully removed all items");
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error removing all items: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("/api/verify-collections")
  public ResponseEntity<String> verifyIfEndpointHasCollections(@RequestParam String endpointUrl) {
    logger.info("Checking if there exist at least one collection from Endpoint URL: {}", endpointUrl);

    try {
      String result = dataService.verifyCollections(endpointUrl);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      logger.error("Error checking collections: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body("Error checking collections: " + e.getMessage());
    }
  }

  @GetMapping("/api/reset-collections")
  public ResponseEntity<String> resetCollections() {
    logger.info("Received request to reset collections");
    try {
      dataService.deleteAllCollections();
      return ResponseEntity.ok("Collections deleted successfully");
    } catch (Exception e) {
      logger.error("Error resetting collections: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body("Error resetting collections: " + e.getMessage());
    }
  }

  @GetMapping("/api/get-collections-by-name")
  public ResponseEntity<List<Map<String, Object>>> getCollectionsByName() {
    logger.info("Received request to get collections by name");
    try {
      List<Map<String, Object>> collections = dataService.getCollectionsByName();
      logger.debug("Successfully fetched collections by name");
      return ResponseEntity.ok(collections);
    } catch (Exception e) {
      logger.error("Error fetching collections by name: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("/api/get-collections-by-date")
  public ResponseEntity<List<Map<String, Object>>> getCollectionsByDate() {
    logger.info("Received request to get collections by name");
    try {
      List<Map<String, Object>> collections = dataService.getCollectionsByDate();
      logger.debug("Successfully fetched collections by name");
      return ResponseEntity.ok(collections);
    } catch (Exception e) {
      logger.error("Error fetching collections by name: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("/api/set-datalayer-geometry/{id}")
  public ResponseEntity<String> insertView(@PathVariable("id") String collectionId) {
    try {
      logger.info("Received request to /api/set-datalayer-geometry");
      dataService.insertView(collectionId);
      logger.info("Successfully processed custom collection");
      return ResponseEntity.ok("Successfully inserted view");
    } catch (Exception e) {
      logger.error("Error inserting View: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body("Error inserting view: " + e.getMessage());
    }
  }
}
