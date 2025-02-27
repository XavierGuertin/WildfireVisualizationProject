package com.example.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.example.backend.repository.StacRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataServiceTests {

  @Mock
  private StacRepository stacRepository;

  @Mock
  private RestTemplate restTemplate;

  @Mock
  private ObjectMapper objectMapper;

  @InjectMocks
  private DataService dataService;

  private Map<String, Object> mockResponse;

  private static final String DEFAULT_ENDPOINT_URL = "https://hirondelle.crim.ca/stac/collections";

  @BeforeEach
  void setUp() {
    mockResponse = new HashMap<>();
    mockResponse.put("collections", List.of(new HashMap<>()));
  }

  @Test
  void fetchAndSaveCollections_ShouldFetchAndSaveCollections() throws JsonProcessingException {
    // Arrange
    Map<String, Object> collection = new HashMap<>();
    collection.put("id", "test-collection");
    mockResponse.put("collections", List.of(collection));
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockResponse);
    when(objectMapper.writeValueAsString(any())).thenReturn("mockedJson");

    // Act
    dataService.fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    verify(stacRepository, times(1)).checkCollectionExists("test-collection");
    verify(stacRepository, times(1)).insertCollection("mockedJson");
  }

  @Test
  void fetchAndSaveCollections_ShouldLogError_WhenExceptionThrown() {
    // Arrange
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenThrow(new RuntimeException("Test exception"));

    // Act & Assert
    try {
      dataService.fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);
    } catch (Exception e) {
      // Expected exception
    }

    verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    verify(stacRepository, times(0)).insertCollection(anyString());
  }

  @Test
  void insertAndQueryCollection_DefaultParams() throws JsonProcessingException {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));
    when(objectMapper.writeValueAsString(any())).thenReturn("mockedJson");

    // Act
    String result = dataService.insertAndQueryCollectionTests();

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(1)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }

  @Test
  void insertAndQueryCollection_WithCollectionJson() throws JsonProcessingException {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));
    when(objectMapper.writeValueAsString(any())).thenReturn("mockedJson");

    // Act
    String result = dataService.insertAndQueryCollectionTests("{\"id\":\"test\"}");

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(1)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }

  @Test
  void insertAndQueryCollection_WithCollectionJsonAndId() throws JsonProcessingException {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));
    when(objectMapper.writeValueAsString(any())).thenReturn("mockedJson");

    // Act
    String result = dataService.insertAndQueryCollectionTests("{\"id\":\"test\"}", "test-id");

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(1)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }

  @Test
  void insertAndQueryCollection_CollectionExists() throws JsonProcessingException {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(true);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));
    when(objectMapper.writeValueAsString(any())).thenReturn("mockedJson");

    // Act
    String result = dataService.insertAndQueryCollectionTests("{\"id\":\"test\"}", "test-id");

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(0)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }

  @Test
  void retrieveMetaData_IsValid() throws JsonProcessingException {
    // retrieveMetaData is just a middle man between the controller and the
    // repository, so there is not real functionality to test

    // Arrange
    when(dataService.retrieveMetaData(anyString())).thenReturn("[]");

    // Act
    String response = dataService.retrieveMetaData("");

    // Assert
    assertThat(response).isNotNull();
  }

  @Test
  void fetchAndSaveCollections_ShouldNotInsert_WhenCollectionExists() {
    // Arrange
    Map<String, Object> collection = new HashMap<>();
    collection.put("id", "existing-collection");
    mockResponse.put("collections", List.of(collection));
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockResponse);
    when(stacRepository.checkCollectionExists("existing-collection")).thenReturn(true);

    // Act
    dataService.fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists("existing-collection");
    verify(stacRepository, times(0)).insertCollection(anyString());
  }

  @Test
  void fetchAndSaveCollections_ShouldInsert_WhenCollectionDoesNotExist() throws Exception {
    // Arrange
    Map<String, Object> collection = new HashMap<>();
    collection.put("id", "new-collection");
    mockResponse.put("collections", List.of(collection));
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockResponse);
    when(stacRepository.checkCollectionExists("new-collection")).thenReturn(false);
    when(objectMapper.writeValueAsString(any())).thenReturn("mockedJson");

    // Act
    dataService.fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists("new-collection");
    verify(stacRepository, times(1)).insertCollection(anyString());
  }

  @Test
  void getCollections_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1", "bbox", "[10,20,30,40]"),
        Map.of("key", "value2", "id", "id2", "bbox", "[50,60,70,80]"));
    when(stacRepository.getAllCollections(null)).thenReturn(mockCollections);

    // Act
    List<Map<String, Object>> collections = dataService.getCollections(null);

    // Assert
    assertThat(collections).isNotNull().hasSize(2);
    assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry("bbox",
        "[10,20,30,40]");
    assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry("bbox",
        "[50,60,70,80]");

    verify(stacRepository, times(1)).getAllCollections(null);
  }

  @Test
  void getCollections_Success_WithBbox() {
    // Arrange
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1", "bbox", "[10,20,30,40]"),
        Map.of("key", "value2", "id", "id2", "bbox", "[50,60,70,80]"));
    when(stacRepository.getAllCollections(eq(bbox))).thenReturn(mockCollections);

    // Act
    List<Map<String, Object>> collections = dataService.getCollections(bbox);

    // Assert
    assertThat(collections).isNotNull().hasSize(2);
    assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry("bbox",
        "[10,20,30,40]");
    assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry("bbox",
        "[50,60,70,80]");

    verify(stacRepository, times(1)).getAllCollections(eq(bbox));
  }

  @Test
  void getCollections_Failure() {
    // Arrange
    when(stacRepository.getAllCollections(any())).thenThrow(new RuntimeException("Test error"));

    // Act & Assert
    assertThatThrownBy(() -> dataService.getCollections(null))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Failed to fetch collections");

    verify(stacRepository, times(1)).getAllCollections(null);
  }

  @Test
  void getCollectionsByName_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1", "bbox", "[10,20,30,40]"),
        Map.of("key", "value2", "id", "id2", "bbox", "[50,60,70,80]"));
    when(stacRepository.getAllCollectionsByName(null)).thenReturn(mockCollections);

    // Act
    List<Map<String, Object>> collections = dataService.getCollectionsByName(null);

    // Assert
    assertThat(collections).isNotNull().hasSize(2);
    assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry("bbox",
        "[10,20,30,40]");
    assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry("bbox",
        "[50,60,70,80]");

    verify(stacRepository, times(1)).getAllCollectionsByName(null);
  }

  @Test
  void getCollectionsByName_Success_WithBbox() {
    // Arrange
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1", "bbox", "[10,20,30,40]"),
        Map.of("key", "value2", "id", "id2", "bbox", "[50,60,70,80]"));
    when(stacRepository.getAllCollectionsByName(eq(bbox))).thenReturn(mockCollections);

    // Act
    List<Map<String, Object>> collections = dataService.getCollectionsByName(bbox);

    // Assert
    assertThat(collections).isNotNull().hasSize(2);
    assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry("bbox",
        "[10,20,30,40]");
    assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry("bbox",
        "[50,60,70,80]");

    verify(stacRepository, times(1)).getAllCollectionsByName(eq(bbox));
  }

  @Test
  void getCollectionsByName_Failure() {
    // Arrange
    when(stacRepository.getAllCollectionsByName(any())).thenThrow(new RuntimeException("Test error"));

    // Act & Assert
    assertThatThrownBy(() -> dataService.getCollectionsByName(null))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Failed to fetch collections by Name");

    verify(stacRepository, times(1)).getAllCollectionsByName(null);
  }

  @Test
  void getCollectionsByDate_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1", "bbox", "[10,20,30,40]"),
        Map.of("key", "value2", "id", "id2", "bbox", "[50,60,70,80]"));
    when(stacRepository.getAllCollectionsByDate(null)).thenReturn(mockCollections);

    // Act
    List<Map<String, Object>> collections = dataService.getCollectionsByDate(null);

    // Assert
    assertThat(collections).isNotNull().hasSize(2);
    assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry("bbox",
        "[10,20,30,40]");
    assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry("bbox",
        "[50,60,70,80]");

    verify(stacRepository, times(1)).getAllCollectionsByDate(null);
  }

  @Test
  void getCollectionsByDate_Success_WithBbox() {
    // Arrange
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1", "bbox", "[10,20,30,40]"),
        Map.of("key", "value2", "id", "id2", "bbox", "[50,60,70,80]"));
    when(stacRepository.getAllCollectionsByDate(eq(bbox))).thenReturn(mockCollections);

    // Act
    List<Map<String, Object>> collections = dataService.getCollectionsByDate(bbox);

    // Assert
    assertThat(collections).isNotNull().hasSize(2);
    assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry("bbox",
        "[10,20,30,40]");
    assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry("bbox",
        "[50,60,70,80]");

    verify(stacRepository, times(1)).getAllCollectionsByDate(eq(bbox));
  }

  @Test
  void getCollectionsByDate_Failure() {
    // Arrange
    when(stacRepository.getAllCollectionsByDate(any())).thenThrow(new RuntimeException("Test error"));

    // Act & Assert
    assertThatThrownBy(() -> dataService.getCollectionsByDate(null))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Failed to fetch collections by Date");

    verify(stacRepository, times(1)).getAllCollectionsByDate(null);
  }

  @Test
  void deleteAllCollections_Success() {
    // Act
    dataService.deleteAllCollections();

    // Assert
    verify(stacRepository, times(1)).deleteAllCollections();
  }

  @Test
  void insertAndQueryCollection_ShouldLogError_WhenExceptionThrown() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenThrow(new RuntimeException("Test exception"));

    // Act & Assert
    assertThatThrownBy(() -> dataService.insertAndQueryCollectionTests())
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Failed to process collection: Test exception");

    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(0)).insertCollection(anyString());
    verify(stacRepository, times(0)).queryCollection(anyString());
  }

  @Test
  void deleteAllCollections_ShouldLogError_WhenExceptionThrown() {
    // Arrange
    doThrow(new RuntimeException("Test exception")).when(stacRepository).deleteAllCollections();

    // Act & Assert
    assertThatThrownBy(() -> dataService.deleteAllCollections())
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Failed to delete collections: Test exception");

    verify(stacRepository, times(1)).deleteAllCollections();
  }

  @Test
  void insertView_Default_Success() {
    // Arrange
    doNothing().when(stacRepository).setDatalayerView("ID");
    when(stacRepository.checkDatalayerView()).thenReturn(true);

    // Act
    dataService.insertView("ID");

    // Assert
    verify(stacRepository, atLeastOnce()).setDatalayerView("ID");
    verify(stacRepository, atLeastOnce()).checkDatalayerView();
  }

  @Test
  void insertView_SleepMillisAdjusted_Failure() {
    // Arrange
    doNothing().when(stacRepository).setDatalayerView("ID");
    when(stacRepository.checkDatalayerView()).thenReturn(false);

    // Act & Assert
    assertThatThrownBy(() -> dataService.insertView("ID", 0))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("View could not be created for collectionId: ID");
  }

  @Test
  void insertView_ShouldHandleInterruptedException() {
    // Arrange
    doNothing().when(stacRepository).setDatalayerView("ID");
    when(stacRepository.checkDatalayerView()).thenReturn(false);

    // Act & Assert
    assertThatThrownBy(() -> {
      Thread.currentThread().interrupt(); // Simulate interruption
      dataService.insertView("ID", 0);
    }).isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("View could not be created for collectionId: ID");

    verify(stacRepository, atLeastOnce()).setDatalayerView("ID");
    verify(stacRepository, atLeastOnce()).checkDatalayerView();
  }

  @Test
  void verifyCollections_ShouldThrowException_WhenCollectionsAreNull() {
    // Arrange
    Map<String, Object> response = new HashMap<>();
    response.put("collections", null);
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);

    // Act & Assert
    assertThatThrownBy(() -> dataService.verifyCollections(DEFAULT_ENDPOINT_URL))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("No collections found at the provided URL");

    verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
  }

  @Test
  void verifyCollections_ShouldThrowException_WhenCollectionsAreEmpty() {
    // Arrange
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(Map.of("collections", List.of()));

    // Act & Assert
    assertThatThrownBy(() -> dataService.verifyCollections(DEFAULT_ENDPOINT_URL))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("No collections found at the provided URL");

    verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
  }

  @Test
  void verifyCollections_ShouldLogError_WhenExceptionThrown() {
    // Arrange
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenThrow(new RuntimeException("Test exception"));

    // Act & Assert
    assertThatThrownBy(() -> dataService.verifyCollections(DEFAULT_ENDPOINT_URL))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error checking collections");

    verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
  }

  @Test
  void insertAndQueryCollectionTests_ShouldReturnNotFound_WhenCollectionDataIsEmpty() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of());

    // Act
    String result = dataService.insertAndQueryCollectionTests("{\"id\":\"test\"}", "test-id");

    // Assert
    assertThat(result).isEqualTo("Collection not found");
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(1)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
  }

  @Test
  void insertItem_Success() {
    // Arrange
    doNothing().when(stacRepository).insertItem(anyString());
    // Act
    dataService.insertItem("Test");
  }

  @Test
  void insertItem_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error fetching item")).when(stacRepository).insertItem(anyString());

    // Assert
    assertThatThrownBy(() -> dataService.insertItem("test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching item");
  }

  @Test
  void getAllItems_Success() {
    // Arrange
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "test1"),
        Map.of("id", "test2"));
    when(stacRepository.getAllItems(anyString())).thenReturn(mockResults);
    // Act
    List<Map<String, Object>> result = dataService.getAllItems("Test");

    // Assert
    assertThat(result).isEqualTo(mockResults);
  }

  @Test
  void getAllItems_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error fetching all items")).when(stacRepository).getAllItems(anyString());

    // Assert
    assertThatThrownBy(() -> dataService.getAllItems("test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching all items");
  }

  @Test
  void getItem_WithId_Success() {
    // Arrange
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "test1"));
    when(stacRepository.getItem(anyString())).thenReturn(mockResults);
    // Act
    List<Map<String, Object>> result = dataService.getItem("Test");

    // Assert
    assertThat(result).isEqualTo(mockResults);
  }

  @Test
  void getItem_WithId_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error fetching item")).when(stacRepository).getItem(anyString());

    // Assert
    assertThatThrownBy(() -> dataService.getItem("test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching item");
  }

  @Test
  void getItem_WithIdAndCollectionId_Success() {
    // Arrange
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "test1"));
    when(stacRepository.getItem(anyString(), anyString())).thenReturn(mockResults);
    // Act
    List<Map<String, Object>> result = dataService.getItem("Test", "Test");

    // Assert
    assertThat(result).isEqualTo(mockResults);
  }

  @Test
  void getItem_WithIdAndCollectionId_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error fetching item")).when(stacRepository).getItem(anyString(), anyString());

    // Assert
    assertThatThrownBy(() -> dataService.getItem("test", "test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching item");
  }

  @Test
  void removeAllItems_Success() {

  }

  @Test
  void removeAllItems_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error removing all items")).when(stacRepository).removeAllItems();

    // Assert
    assertThatThrownBy(() -> dataService.removeAllItems())
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error removing all items");
  }

  @Test
  void removeItemsFromCollection_Success() {

  }

  @Test
  void removeItemsFromCollection_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error removing item")).when(stacRepository).removeItemsFromCollection(anyString());

    // Assert
    assertThatThrownBy(() -> dataService.removeItemsFromCollection("test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error removing item");
  }

  @Test
  void removeItem_Success() {

  }

  @Test
  void removeItem_Failure() {
    // Arrange
    doThrow(new RuntimeException("Error removing item")).when(stacRepository).removeItem(anyString(), anyString());

    // Assert
    assertThatThrownBy(() -> dataService.removeItem("test", "test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error removing item");
  }

}
