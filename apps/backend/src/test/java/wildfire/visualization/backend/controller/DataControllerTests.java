package wildfire.visualization.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.request.WebRequest;

import wildfire.visualization.backend.exception.DataException;
import wildfire.visualization.backend.exception.GlobalExceptionHandler;
import wildfire.visualization.backend.model.ApiError;
import wildfire.visualization.backend.service.DataService;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.awaitility.Awaitility.await;

@ExtendWith(MockitoExtension.class)
class DataControllerTests {

  @Mock
  private DataService dataService;

  @InjectMocks
  private DataController dataController;

  private MockMvc mockMvc;
  private ObjectMapper objectMapper;

  private static final String DEFAULT_ENDPOINT_URL = "https://hirondelle.crim.ca/stac/collections";

  @BeforeEach
  void setUp() {
    // Initialize MockMvc with the GlobalExceptionHandler
    mockMvc = MockMvcBuilders
        .standaloneSetup(dataController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();

    objectMapper = new ObjectMapper();
  }

  @Test
  void getMetaData_Success() throws Exception {
    // Arrange
    String collectionId = "ID";
    String expectedResponse = "[]";
    when(dataService.retrieveCollectionMetaData(collectionId)).thenReturn(expectedResponse);

    // Act & Assert
    mockMvc.perform(get("/api/metadata/{id}", collectionId))
        .andExpect(status().isOk())
        .andExpect(content().string(expectedResponse));

    verify(dataService, times(1)).retrieveCollectionMetaData(collectionId);
  }

  @Test
  void getMetaData_Failure() throws Exception {
    // Arrange
    String collectionId = "ID";
    when(dataService.retrieveCollectionMetaData(collectionId))
        .thenThrow(new DataException("Failed to retrieve metadata"));

    // Act & Assert
    mockMvc.perform(get("/api/metadata/{id}", collectionId))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Failed to retrieve metadata"));

    verify(dataService, times(1)).retrieveCollectionMetaData(collectionId);
  }

  @Test
  void fetchCollections_Success() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/fetch-collections")
        .param("endpointUrl", DEFAULT_ENDPOINT_URL))
        .andExpect(status().isOk())
        .andExpect(content().string("Collections fetched and saved successfully"));

    verify(dataService, times(1)).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);
  }

  @Test
  void fetchCollections_Failure() throws Exception {
    // Arrange
    doThrow(new DataException("Test error")).when(dataService).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);

    // Act & Assert
    mockMvc.perform(get("/api/fetch-collections")
        .param("endpointUrl", DEFAULT_ENDPOINT_URL))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).fetchAndSaveCollections(DEFAULT_ENDPOINT_URL);
  }

  @Test
  void getCollections_Success_NoBbox() throws Exception {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value1", "id", "id1"),
        Map.of("key", "value2", "id", "id2"));

    when(dataService.getCollections(null)).thenReturn(mockCollections);

    // Act & Assert
    mockMvc.perform(get("/api/get-collections"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockCollections)));

    verify(dataService, times(1)).getCollections(null);
  }

  @Test
  void getCollections_Success_WithValidBbox() throws Exception {
    // Arrange
    String bboxStr = "10,20,30,40";
    double[] expectedBbox = new double[] { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("key", "value3", "id", "id3"),
        Map.of("key", "value4", "id", "id4"));

    when(dataService.getCollections(expectedBbox)).thenReturn(mockCollections);

    // Act & Assert
    mockMvc.perform(get("/api/get-collections")
        .param("bbox", bboxStr))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockCollections)));

    verify(dataService, times(1)).getCollections(expectedBbox);
  }

  @Test
  void getCollections_InvalidBboxFormat() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/get-collections")
        .param("bbox", "10,20")) // Only two values instead of four
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Invalid BBOX format: Expected 4 values"));

    verifyNoInteractions(dataService);
  }

  @Test
  void getCollections_Failure() throws Exception {
    // Arrange
    when(dataService.getCollections(null))
        .thenThrow(new DataException("Test error"));

    // Act & Assert
    mockMvc.perform(get("/api/get-collections"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).getCollections(null);
  }

  @Test
  void resetCollections_Success() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/reset-collections"))
        .andExpect(status().isOk())
        .andExpect(content().string("Collections deleted successfully"));

    verify(dataService, times(1)).deleteAllCollections();
  }

  @Test
  void resetCollections_Failure() throws Exception {
    // Arrange
    doThrow(new DataException("Test error"))
        .when(dataService).deleteAllCollections();

    // Act & Assert
    mockMvc.perform(get("/api/reset-collections"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).deleteAllCollections();
  }

  @Test
  void getCollectionsByName_Success_NoBbox() throws Exception {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("name", "Collection A", "id", "id1"),
        Map.of("name", "Collection B", "id", "id2"));

    when(dataService.getCollectionsByName(null, "asc")).thenReturn(mockCollections);

    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-name"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockCollections)));

    verify(dataService, times(1)).getCollectionsByName(null, "asc");
  }

  @Test
  void getCollectionsByName_Success_WithValidBbox() throws Exception {
    // Arrange
    String bboxStr = "10,20,30,40";
    double[] expectedBbox = new double[] { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("name", "Collection C", "id", "id3"),
        Map.of("name", "Collection D", "id", "id4"));

    when(dataService.getCollectionsByName(expectedBbox, "asc")).thenReturn(mockCollections);

    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-name")
        .param("bbox", bboxStr))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockCollections)));

    verify(dataService, times(1)).getCollectionsByName(expectedBbox, "asc");
  }

  @Test
  void getCollectionsByName_InvalidBboxFormat() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-name")
        .param("bbox", "10,20")) // Only two values instead of four
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Invalid BBOX format: Expected 4 values"));

    verifyNoInteractions(dataService);
  }

  @Test
  void getCollectionsByName_Failure() throws Exception {
    // Arrange
    when(dataService.getCollectionsByName(null, "asc"))
        .thenThrow(new DataException("Test error"));

    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-name"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).getCollectionsByName(null, "asc");
  }

  @Test
  void getCollectionsByDate_Success_NoBbox() throws Exception {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("date", "2023-01-01", "id", "id1"),
        Map.of("date", "2023-02-01", "id", "id2"));

    when(dataService.getCollectionsByDate(null, "asc")).thenReturn(mockCollections);

    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-date"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockCollections)));

    verify(dataService, times(1)).getCollectionsByDate(null, "asc");
  }

  @Test
  void getCollectionsByDate_Success_WithValidBbox() throws Exception {
    // Arrange
    String bboxStr = "10,20,30,40";
    double[] expectedBbox = new double[] { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockCollections = List.of(
        Map.of("date", "2023-03-01", "id", "id3"),
        Map.of("date", "2023-04-01", "id", "id4"));

    when(dataService.getCollectionsByDate(expectedBbox, "asc")).thenReturn(mockCollections);

    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-date")
        .param("bbox", bboxStr))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockCollections)));

    verify(dataService, times(1)).getCollectionsByDate(expectedBbox, "asc");
  }

  @Test
  void getCollectionsByDate_InvalidBboxFormat() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-date")
        .param("bbox", "10,20")) // Only two values instead of four
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Invalid BBOX format: Expected 4 values"));

    verifyNoInteractions(dataService);
  }

  @Test
  void getCollectionsByDate_Failure() throws Exception {
    // Arrange
    when(dataService.getCollectionsByDate(null, "asc"))
        .thenThrow(new DataException("Test error"));

    // Act & Assert
    mockMvc.perform(get("/api/get-collections-by-date"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).getCollectionsByDate(null, "asc");
  }

  @Test
  void insertView_Success() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/set-datalayer-geometry/{id}", "ID"))
        .andExpect(status().isOk())
        .andExpect(content().string("Successfully inserted view"));

    verify(dataService, times(1)).insertView("ID");
  }

  @Test
  void insertView_Failure() throws Exception {
    // Arrange
    doThrow(new DataException("Test error"))
        .when(dataService).insertView("ID");

    // Act & Assert
    mockMvc.perform(get("/api/set-datalayer-geometry/{id}", "ID"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).insertView("ID");
  }

  @Test
  void fetchItems_Failure() throws Exception {
    // Create a DataException with the expected error message
    DataException exception = new DataException("Error retrieving all items for collection");

    WebRequest webRequest = mock(WebRequest.class);
    when(webRequest.getDescription(anyBoolean())).thenReturn("test request");

    // Create a response entity that your GlobalExceptionHandler would produce
    ResponseEntity<ApiError> errorResponse = new GlobalExceptionHandler()
        .handleDataException(exception, webRequest);

    // Assert the response has the expected status code and body
    assertThat(errorResponse.getStatusCode().value()).isEqualTo(400);
    assertThat(errorResponse.getBody().getError()).isEqualTo("Data Error");
    assertThat(errorResponse.getBody().getMessage()).isEqualTo("Error retrieving all items for collection");
  }

  @Test
  void getItem_Success() throws Exception {
    // Arrange
    String itemId = "test";
    String collectionId = "test";
    List<Map<String, Object>> mockResult = List.of(
        Map.of("id", "test1"));

    when(dataService.getItem(itemId, collectionId)).thenReturn(mockResult);

    // Act & Assert
    mockMvc.perform(get("/api/get-item/{id}/{collection}", itemId, collectionId))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockResult)));

    verify(dataService, times(1)).getItem(itemId, collectionId);
  }

  @Test
  void getFetchProgress_Success() throws Exception {
    // Arrange
    String collectionId = "testCollection";
    when(dataService.getProgress(collectionId)).thenReturn(45); // Mock progress

    // Act & Assert
    mockMvc.perform(get("/api/fetch-progress/{collectionId}", collectionId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.collectionId").value(collectionId))
        .andExpect(jsonPath("$.progress").value(45));

    verify(dataService, times(1)).getProgress(collectionId);
  }

  @Test
  void getFetchProgress_NoProgress() throws Exception {
    // Arrange
    String collectionId = "testCollection";
    when(dataService.getProgress(collectionId)).thenReturn(-1); // No progress

    // Act & Assert
    mockMvc.perform(get("/api/fetch-progress/{collectionId}", collectionId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.collectionId").value(collectionId))
        .andExpect(jsonPath("$.progress").value(-1));

    verify(dataService, times(1)).getProgress(collectionId);
  }

  @Test
  void getItem_Failure() throws Exception {
    // Arrange
    String itemId = "test";
    String collectionId = "test";

    when(dataService.getItem(itemId, collectionId))
        .thenThrow(new DataException("Item retrieval error"));

    // Act & Assert
    mockMvc.perform(get("/api/get-item/{id}/{collection}", itemId, collectionId))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Item retrieval error"));

    verify(dataService, times(1)).getItem(itemId, collectionId);
  }

  @Test
  void removeAllItems_Success() throws Exception {
    // Arrange
    when(dataService.removeAllItems()).thenReturn("Success!");

    // Act & Assert
    mockMvc.perform(delete("/api/remove-all-items"))
        .andExpect(status().isOk())
        .andExpect(content().string("Success!"));

    verify(dataService, times(1)).removeAllItems();
  }

  @Test
  void removeAllItems_Failure() throws Exception {
    // Arrange
    when(dataService.removeAllItems())
        .thenThrow(new DataException("Error removing all items"));

    // Act & Assert
    mockMvc.perform(delete("/api/remove-all-items"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Error removing all items"));

    verify(dataService, times(1)).removeAllItems();
  }

  @Test
  void removeItemsFromCollection_Success() throws Exception {
    // Arrange
    String collectionId = "test";
    when(dataService.removeItemsFromCollection(collectionId)).thenReturn("Success!");

    // Act & Assert
    mockMvc.perform(delete("/api/remove-items-from-collection/{collectionId}", collectionId))
        .andExpect(status().isOk())
        .andExpect(content().string("Success!"));

    verify(dataService, times(1)).removeItemsFromCollection(collectionId);
  }

  @Test
  void removeItemsFromCollection_Failure() throws Exception {
    // Arrange
    String collectionId = "Test";
    doThrow(new DataException("Error removing items from collection"))
        .when(dataService).removeItemsFromCollection(collectionId);

    // Act & Assert
    mockMvc.perform(delete("/api/remove-items-from-collection/{collectionId}", collectionId))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Error removing items from collection"));

    verify(dataService, times(1)).removeItemsFromCollection(collectionId);
  }

  @Test
  void removeItem_Success() throws Exception {
    // Arrange
    String itemId = "test";
    String collectionId = "test";
    when(dataService.removeItem(itemId, collectionId)).thenReturn("Success!");

    // Act & Assert
    mockMvc.perform(delete("/api/remove-item/{id}/{collection}", itemId, collectionId))
        .andExpect(status().isOk())
        .andExpect(content().string("Success!"));

    verify(dataService, times(1)).removeItem(itemId, collectionId);
  }

  @Test
  void removeItem_Failure() throws Exception {
    // Arrange
    String itemId = "Test";
    String collectionId = "Test";
    doThrow(new DataException("Error removing item"))
        .when(dataService).removeItem(itemId, collectionId);

    // Act & Assert
    mockMvc.perform(delete("/api/remove-item/{id}/{collection}", itemId, collectionId))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Error removing item"));

    verify(dataService, times(1)).removeItem(itemId, collectionId);
  }

  @Test
  void fetchCollections_ShouldHandleURISyntaxException() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/fetch-collections")
        .param("endpointUrl", "invalid-url"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Invalid URL provided: invalid-url"));
  }

  @Test
  void verifyIfEndpointHasCollections_ShouldReturnResult() throws Exception {
    // Arrange
    when(dataService.verifyCollections(DEFAULT_ENDPOINT_URL)).thenReturn("Verification result");

    // Act & Assert
    mockMvc.perform(get("/api/verify-collections")
        .param("endpointUrl", DEFAULT_ENDPOINT_URL))
        .andExpect(status().isOk())
        .andExpect(content().string("Verification result"));

    verify(dataService, times(1)).verifyCollections(DEFAULT_ENDPOINT_URL);
  }

  @Test
  void verifyIfEndpointHasCollections_ShouldHandleException() throws Exception {
    // Arrange
    when(dataService.verifyCollections(DEFAULT_ENDPOINT_URL))
        .thenThrow(new DataException("Test error"));

    // Act & Assert
    mockMvc.perform(get("/api/verify-collections")
        .param("endpointUrl", DEFAULT_ENDPOINT_URL))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).verifyCollections(DEFAULT_ENDPOINT_URL);
  }

  @Test
  void getCollections_WithNonNumericBbox() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/get-collections")
        .param("bbox", "10,20,abc,40"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value(containsString("Error parsing BBOX: Invalid number format")));

    verifyNoInteractions(dataService);
  }

  @Test
  void resetItems_Success() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/reset-items"))
        .andExpect(status().isOk())
        .andExpect(content().string("Items deleted successfully"));

    verify(dataService, times(1)).deleteAllItems();
  }

  @Test
  void resetItems_Failure() throws Exception {
    // Arrange
    doThrow(new DataException("Test error"))
        .when(dataService).deleteAllItems();

    // Act & Assert
    mockMvc.perform(get("/api/reset-items"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Test error"));

    verify(dataService, times(1)).deleteAllItems();
  }

  @Test
  void verifyInternetConnection_Success() throws Exception {
    // Arrange
    when(dataService.verifyInternetConnection(DEFAULT_ENDPOINT_URL)).thenReturn("Connected");

    // Act & Assert
    mockMvc.perform(get("/api/verify-internet-connection")
        .param("endpointUrl", DEFAULT_ENDPOINT_URL))
        .andExpect(status().isOk())
        .andExpect(content().string("Connected"));

    verify(dataService, times(1)).verifyInternetConnection(DEFAULT_ENDPOINT_URL);
  }

  @Test
  void verifyInternetConnection_Failure() throws Exception {
    // Arrange
    when(dataService.verifyInternetConnection(DEFAULT_ENDPOINT_URL))
        .thenThrow(new DataException("Cannot connect to endpoint"));

    // Act & Assert
    mockMvc.perform(get("/api/verify-internet-connection")
        .param("endpointUrl", DEFAULT_ENDPOINT_URL))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Cannot connect to endpoint"));

    verify(dataService, times(1)).verifyInternetConnection(DEFAULT_ENDPOINT_URL);
  }

  @Test
  void fetchItemsTimestamps_Success() throws Exception {
    // Arrange
    List<String> mockTimestamps = List.of("2023-01-01T12:00:00Z", "2023-02-01T12:00:00Z");
    when(dataService.fetchItemsTimestamps()).thenReturn(mockTimestamps);

    // Act & Assert
    mockMvc.perform(get("/api/fetch-items-timestamps"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockTimestamps)));

    verify(dataService, times(1)).fetchItemsTimestamps();
  }

  @Test
  void fetchItemsTimestamps_Failure() throws Exception {
    // Arrange
    when(dataService.fetchItemsTimestamps())
        .thenThrow(new DataException("Error retrieving timestamps"));

    // Act & Assert
    mockMvc.perform(get("/api/fetch-items-timestamps"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Error retrieving timestamps"));

    verify(dataService, times(1)).fetchItemsTimestamps();
  }

  @Test
  void resetView_Success() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/reset-datalayer-view"))
        .andExpect(status().isOk())
        .andExpect(content().string("View reset successfully"));

    verify(dataService, times(1)).resetView();
  }

  @Test
  void resetView_Failure() throws Exception {
    // Arrange
    doThrow(new DataException("Error resetting view"))
        .when(dataService).resetView();

    // Act & Assert
    mockMvc.perform(get("/api/reset-datalayer-view"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Error resetting view"));

    verify(dataService, times(1)).resetView();
  }

  @Test
  void loadAssets_Success() throws Exception {
    // Arrange
    String collectionId = "testCollection";
    String itemId = "testItem";

    // We can't verify execution due to async, but ensure the method is called
    doNothing().when(dataService).processItemAssets(anyString());

    // Act & Assert
    mockMvc.perform(get("/api/load-assets/{collectionId}", collectionId, itemId))
        .andExpect(status().isOk())
        .andExpect(content().string("Processing started in the background. Check logs for completion."));

    await().atMost(2, TimeUnit.SECONDS).untilAsserted(() -> verify(dataService).processItemAssets(collectionId));

    verify(dataService, times(1)).processItemAssets(collectionId);
  }

  @Test
  void loadAssets_Failure_ShouldStillReturnSuccess() throws Exception {
    // Arrange
    String collectionId = "testCollection";

    // Simulate an exception during async processing
    doThrow(new RuntimeException("Processing error")).when(dataService).processItemAssets(anyString());

    // Act & Assert
    mockMvc.perform(get("/api/load-assets/{collectionId}", collectionId))
        .andExpect(status().isOk()) // Still returns 200 OK since exception is async
        .andExpect(content().string("Processing started in the background. Check logs for completion."));

    // Optional: Give async execution a brief moment
    await().atMost(2, TimeUnit.SECONDS).untilAsserted(() -> verify(dataService).processItemAssets(collectionId));

    // Verify method was still called
    verify(dataService, times(1)).processItemAssets(collectionId);
  }

  @Test
  void loadAssets_Failure_CatchException() throws Exception {
    // Arrange
    String collectionId = "testCollection";
    String itemId = "testItem";

    // Mock CompletableFuture to simulate an exception in async execution
    try (MockedStatic<CompletableFuture> mockedCompletableFuture = mockStatic(CompletableFuture.class)) {
      mockedCompletableFuture.when(() -> CompletableFuture.runAsync(any(Runnable.class)))
          .thenThrow(new RuntimeException("Async processing error"));

      // Act & Assert
      mockMvc.perform(get("/api/load-assets/{collectionId}", collectionId, itemId))
          .andExpect(status().isInternalServerError())
          .andExpect(content().string("Failed to start processing."));
    }
  }

  @Test
  void getLoadedLayers_Success() throws Exception {
    // Arrange
    List<Map<String, Object>> mockLayers = List.of(
        Map.of("layer", "layer1"),
        Map.of("layer", "layer2"));

    when(dataService.getLoadedLayers()).thenReturn(mockLayers);

    // Act & Assert
    mockMvc.perform(get("/api/get-loaded-layers"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockLayers)));

    verify(dataService, times(1)).getLoadedLayers();
  }

  @Test
  void getLoadedLayers_Failure() throws Exception {
    // Arrange
    doThrow(new DataException("Failed to fetch loaded layers")).when(dataService).getLoadedLayers();

    // Act & Assert
    mockMvc.perform(get("/api/get-loaded-layers"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Failed to fetch loaded layers"));

    verify(dataService, times(1)).getLoadedLayers();
  }

  @Test
  void resetItemAssets_Success() throws Exception {
    // Arrange
    when(dataService.itemAssetsReset()).thenReturn(true);

    // Act & Assert
    mockMvc.perform(post("/api/reset-item-assets"))
        .andExpect(status().isOk())
        .andExpect(content().string("Item asset layers reset successfully."));

    // Verify interaction
    verify(dataService, times(1)).itemAssetsReset();
  }

  @Test
  void resetItemAssets_Failure() throws Exception {
    // Arrange
    when(dataService.itemAssetsReset()).thenReturn(false);

    // Act & Assert
    mockMvc.perform(post("/api/reset-item-assets"))
        .andExpect(status().isInternalServerError())
        .andExpect(content().string("Failed to reset item asset layers."));

    // Verify interaction
    verify(dataService, times(1)).itemAssetsReset();
  }

  @Test
  void loadAssetLayers_shouldReturnOk_whenProcessingStarts() throws Exception {
    // Given
    String itemId = "wildfire_item_001";

    // When
    mockMvc.perform(get("/api/load-asset-layers/{itemId}", itemId)
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(content().string("Processing started in the background. Check logs for completion."));

    // Then
    verify(dataService).processItemAssetsRefresh(itemId);
  }

  @Test
  void loadAssetLayers_shouldReturnServerError_whenExceptionThrown() throws Exception {
    // Given
    String itemId = "wildfire_item_001";
    doThrow(new RuntimeException("Simulated failure")).when(dataService).processItemAssetsRefresh(itemId);

    // When
    mockMvc.perform(get("/api/load-asset-layers/{itemId}", itemId)
        .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isInternalServerError())
        .andExpect(content().string("Failed to start processing."));
  }

  @Test
  void fetchItemIdsOrderedByTimestamp_Success() throws Exception {
    // Arrange
    List<String> mockIds = List.of("item-001", "item-002", "item-003");
    when(dataService.getItemsIdsOrderedByTimestamp()).thenReturn(mockIds);

    // Act & Assert
    mockMvc.perform(get("/api/fetch-item-ids"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json(objectMapper.writeValueAsString(mockIds)));

    verify(dataService, times(1)).getItemsIdsOrderedByTimestamp();
  }

  @Test
  void fetchItemIdsOrderedByTimestamp_Failure() throws Exception {
    // Arrange
    when(dataService.getItemsIdsOrderedByTimestamp())
        .thenThrow(new DataException("Error retrieving item IDs"));

    // Act & Assert
    mockMvc.perform(get("/api/fetch-item-ids"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.error").value("Data Error"))
        .andExpect(jsonPath("$.message").value("Error retrieving item IDs"));

    verify(dataService, times(1)).getItemsIdsOrderedByTimestamp();
  }

}
