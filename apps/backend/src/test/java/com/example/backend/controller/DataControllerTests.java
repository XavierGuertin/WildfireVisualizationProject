package com.example.backend.controller;

import com.example.backend.service.DataService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.coyote.Response;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataControllerTests {

  @Mock
  private DataService dataService;

  @InjectMocks
  private DataController dataController;

  private static final String DEFAULT_ENDPOINT_URL = "https://hirondelle.crim.ca/stac/collections";

  @Test
  void getData_Success() {
    // Act
    ResponseEntity<String> response = dataController.getData();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
  }

  @Test
  void testStacEndpoint_Success() {
    // Arrange
    when(dataService.insertAndQueryCollectionTests())
        .thenReturn("Success result");

    // Act
    ResponseEntity<String> response = dataController.testStacEndpoint();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Success result");
  }

  @Test
  void testStacEndpoint_Failure() {
    // Arrange
    when(dataService.insertAndQueryCollectionTests())
        .thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<String> response = dataController.testStacEndpoint();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Test error");
  }

  @Test
  void getMetaData_Success() throws JsonProcessingException {

    // Arrange
    when(dataService.retrieveMetaData(anyString())).thenReturn("[]");

    // Act
    ResponseEntity<String> response = dataController.getMetaData("ID");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
  }

  @Test
  void getMetaData_Failure() throws JsonProcessingException {

    // Arrange
    when(dataService.retrieveMetaData(anyString())).thenThrow(new RuntimeException("Entry not found"));

    // Act
    ResponseEntity<String> response = dataController.getMetaData("ID");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isEqualTo("Error processing MetaData: Entry not found");
  }

  @Test
  void createCollection_Success() {
    // Arrange
    String testJson = "{\"id\":\"test\"}";
    when(dataService.insertAndQueryCollectionTests(anyString()))
        .thenReturn("Success result");

    // Act
    ResponseEntity<String> response = dataController.createCollection(testJson);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Success result");
  }

  @Test
  void createCollection_Failure() {
    // Arrange
    String testJson = "{\"id\":\"test\"}";
    when(dataService.insertAndQueryCollectionTests(anyString()))
        .thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<String> response = dataController.createCollection(testJson);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Test error");
  }

  @Test
  void fetchCollections_Success() {
    // Act
    ResponseEntity<String> response = dataController.fetchCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    verify(dataService, times(1)).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Collections fetched and saved successfully");
  }

  @Test
  void fetchCollections_Failure() {
    // Arrange
    doThrow(new RuntimeException("Test error")).when(dataService).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);

    // Act
    ResponseEntity<String> response = dataController.fetchCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    verify(dataService, times(1)).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Error fetching collections: Test error");
  }

  @Test
  void handleIOException() {
    // Arrange
    doThrow(new RuntimeException("Test IO error")).when(dataService).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);

    // Act
    ResponseEntity<String> response = dataController.fetchCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Error fetching collections: Test IO error");
  }

  @Test
  void getCollections_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1"),
        Map.of("key", "value2", "id", "id2"));

    when(dataService.getCollections(null)).thenReturn(mockCollections);

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollections(null);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(mockCollections);
    verify(dataService).getCollections(null);
  }

  @Test
  void getCollections_Success_WithValidBbox() {
    // Arrange
    String bboxStr = "10,20,30,40";
    double[] expectedBbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value3", "id", "id3"),
        Map.of("key", "value4", "id", "id4"));

    when(dataService.getCollections(expectedBbox)).thenReturn(mockCollections);

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollections(bboxStr);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(mockCollections);
    verify(dataService).getCollections(expectedBbox);
  }

  @Test
  void getCollections_InvalidBboxFormat_ReturnsBadRequest() {
    // Arrange
    String invalidBboxStr = "10,20"; // Only two values instead of four

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollections(invalidBboxStr);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNull();
    verifyNoInteractions(dataService); // Ensure dataService is not called due to bad input
  }

  @Test
  void getCollections_Failure() {
    // Arrange
    when(dataService.getCollections(null)).thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollections(null);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isNull();
    verify(dataService).getCollections(null);
  }

  @Test
  void resetCollections_Success() {
    // Act
    ResponseEntity<String> response = dataController.resetCollections();

    // Assert
    verify(dataService, times(1)).deleteAllCollections();
    verify(dataService, times(0)).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Collections deleted successfully");
  }

  @Test
  void resetCollections_Failure() {
    // Arrange
    doThrow(new RuntimeException("Test error")).when(dataService).deleteAllCollections();

    // Act
    ResponseEntity<String> response = dataController.resetCollections();

    // Assert
    verify(dataService, times(1)).deleteAllCollections();
    verify(dataService, times(0)).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Error resetting collections: Test error");
  }

  @Test
  void getCollectionsByName_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("name", "Collection A", "id", "id1"),
        Map.of("name", "Collection B", "id", "id2"));

    when(dataService.getCollectionsByName(null)).thenReturn(mockCollections);

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByName(null);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(mockCollections);
    verify(dataService).getCollectionsByName(null);
  }

  @Test
  void getCollectionsByName_Success_WithValidBbox() {
    // Arrange
    String bboxStr = "10,20,30,40";
    double[] expectedBbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("name", "Collection C", "id", "id3"),
        Map.of("name", "Collection D", "id", "id4"));

    when(dataService.getCollectionsByName(expectedBbox)).thenReturn(mockCollections);

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByName(bboxStr);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(mockCollections);
    verify(dataService).getCollectionsByName(expectedBbox);
  }

  @Test
  void getCollectionsByName_InvalidBboxFormat_ReturnsBadRequest() {
    // Arrange
    String invalidBboxStr = "10,20"; // Only two values instead of four

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByName(invalidBboxStr);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNull();
    verifyNoInteractions(dataService); // Ensure dataService is not called due to bad input
  }

  @Test
  void getCollectionsByName_Failure() {
    // Arrange
    when(dataService.getCollectionsByName(null)).thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByName(null);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isNull();
    verify(dataService).getCollectionsByName(null);
  }

  @Test
  void getCollectionsByDate_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("date", "2023-01-01", "id", "id1"),
        Map.of("date", "2023-02-01", "id", "id2"));

    when(dataService.getCollectionsByDate(null)).thenReturn(mockCollections);

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByDate(null);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(mockCollections);
    verify(dataService).getCollectionsByDate(null);
  }

  @Test
  void getCollectionsByDate_Success_WithValidBbox() {
    // Arrange
    String bboxStr = "10,20,30,40";
    double[] expectedBbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("date", "2023-03-01", "id", "id3"),
        Map.of("date", "2023-04-01", "id", "id4"));

    when(dataService.getCollectionsByDate(expectedBbox)).thenReturn(mockCollections);

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByDate(bboxStr);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(mockCollections);
    verify(dataService).getCollectionsByDate(expectedBbox);
  }

  @Test
  void getCollectionsByDate_InvalidBboxFormat_ReturnsBadRequest() {
    // Arrange
    String invalidBboxStr = "10,20"; // Only two values instead of four

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByDate(invalidBboxStr);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).isNull();
    verifyNoInteractions(dataService); // Ensure dataService is not called due to bad input
  }

  @Test
  void getCollectionsByDate_Failure() {
    // Arrange
    when(dataService.getCollectionsByDate(null)).thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollectionsByDate(null);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isNull();
    verify(dataService).getCollectionsByDate(null);
  }

  @Test
  void insertView_Success() {
    // Arrange
    doNothing().when(dataService).insertView("ID");

    // Act
    ResponseEntity<String> response = dataController.insertView("ID");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
  }

  @Test
  void insertView_Failure() {
    // Arrange
    doThrow(new RuntimeException("Test error")).when(dataService).insertView("ID");

    // Act
    ResponseEntity<String> response = dataController.insertView("ID");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  void createItem_Success() {
    // Arrange
    doNothing().when(dataService).insertItem(anyString());
    // Act
    ResponseEntity<String> result = dataController.createItem("test");
    // Assert
    assertThat(result).isEqualTo(ResponseEntity.ok("Successfully inserted item"));
  }

  @Test
  void createItem_Failure() {
    // Arrange
    doThrow(new RuntimeException("Insertion error")).when(dataService).insertItem(anyString());

    // Act
    ResponseEntity<String> response = dataController.createItem("Test");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  void fetchItems_Success() {
    // Arrange
    List<Map<String, Object>> mockResult = List.of(
        Map.of("id", "test1"),
        Map.of("id", "test2"));

    when(dataService.getAllItems(anyString())).thenReturn(mockResult);
    // Act
    ResponseEntity<List<Map<String, Object>>> result = dataController.fetchItems("test");
    // Assert
    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(result.getBody()).isEqualTo(mockResult);
  }

  @Test
  void fetchItems_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error retrieving all items for collection")).when(dataService)
        .getAllItems(anyString());

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.fetchItems("Test");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  void getItem_Success() {
    // Arrange
    List<Map<String, Object>> mockResult = List.of(
        Map.of("id", "test1"));

    when(dataService.getItem(anyString(), anyString())).thenReturn(mockResult);
    // Act
    ResponseEntity<List<Map<String, Object>>> result = dataController.getItem("test", "test");
    // Assert
    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(result.getBody()).isEqualTo(mockResult);
  }

  @Test
  void getItem_Failure() {
    // Arrange
    doThrow(new RuntimeException("Item retrieval error")).when(dataService).getItem(anyString(), anyString());

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getItem("Test", "Test");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  void removeAllItems_Success() {
    // Arrange
    ResponseEntity<String> mockResult = ResponseEntity.ok("Success!");
    when(dataService.removeAllItems()).thenReturn("Success!");
    // Act
    ResponseEntity<String> result = dataController.removeAllItems();
    // Assert
    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(result).isEqualTo(mockResult);
  }

  @Test
  void removeAllItems_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error removing all items")).when(dataService).removeAllItems();

    // Act
    ResponseEntity<String> response = dataController.removeAllItems();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  void removeItemsFromCollection_Success() {
    // Arrange
    ResponseEntity<String> mockResult = ResponseEntity.ok("Success!");
    when(dataService.removeItemsFromCollection(anyString())).thenReturn("Success!");
    // Act
    ResponseEntity<String> result = dataController.removeItemsFromCollection("test");
    // Assert
    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(result).isEqualTo(mockResult);
  }

  @Test
  void removeItemsFromCollection_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error removing items from collection")).when(dataService)
        .removeItemsFromCollection(anyString());

    // Act
    ResponseEntity<String> response = dataController.removeItemsFromCollection("Test");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  void removeItem_Success() {
    // Arrange
    ResponseEntity<String> mockResult = ResponseEntity.ok("Success!");
    when(dataService.removeItem(anyString(), anyString())).thenReturn("Success!");
    // Act
    ResponseEntity<String> result = dataController.removeItem("test", "test");
    // Assert
    assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(result).isEqualTo(mockResult);
  }

  @Test
  void removeItem_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error removing item")).when(dataService).removeItem(anyString(), anyString());

    // Act
    ResponseEntity<String> response = dataController.removeItem("Test", "Test");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @Test
  void fetchCollections_ShouldHandleURISyntaxException() {
    // Act
    ResponseEntity<String> response = dataController.fetchCollections("invalid-url");

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).contains("Invalid URL provided: invalid-url");
  }

  @Test
  void verifyIfEndpointHasCollections_ShouldLogInfoAndReturnResult() {
    // Arrange
    when(dataService.verifyCollections(DEFAULT_ENDPOINT_URL)).thenReturn("Verification result");

    // Act
    ResponseEntity<String> response = dataController.verifyIfEndpointHasCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Verification result");
  }

  @Test
  void verifyIfEndpointHasCollections_ShouldHandleException() {
    // Arrange
    when(dataService.verifyCollections(DEFAULT_ENDPOINT_URL)).thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<String> response = dataController.verifyIfEndpointHasCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Error checking collections: Test error");
  }
}
