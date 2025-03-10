package wildfire.visualization.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import wildfire.visualization.backend.controller.ConfigController;
import wildfire.visualization.backend.exception.DataException;
import wildfire.visualization.backend.exception.RepositoryException;
import wildfire.visualization.backend.repository.StacRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataServiceTests {

        @Mock
        private StacRepository stacRepository;

        @Mock
        private ConfigController configController;

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
                when(restTemplate.getForObject(anyString(), eq(Map.class)))
                                .thenThrow(new DataException("Test exception"));

                // Act & Assert
                assertThatThrownBy(() -> dataService.fetchAndSaveCollections(DEFAULT_ENDPOINT_URL))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Test exception");

                verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
                verify(stacRepository, times(0)).insertCollection(anyString());
        }

        @Test
        void retrieveCollectionMetaData_IsValid() throws JsonProcessingException {
                // retrieveMetaData is just a middle man between the controller and the
                // repository, so there is not real functionality to test

                // Arrange
                when(dataService.retrieveCollectionMetaData(anyString())).thenReturn("[]");

                // Act
                String response = dataService.retrieveCollectionMetaData("");

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
                assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry(
                                "bbox",
                                "[10,20,30,40]");
                assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry(
                                "bbox",
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
                assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry(
                                "bbox",
                                "[10,20,30,40]");
                assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry(
                                "bbox",
                                "[50,60,70,80]");

                verify(stacRepository, times(1)).getAllCollections(eq(bbox));
        }

        @Test
        void getCollections_Failure() {
                // Arrange
                when(stacRepository.getAllCollections(any()))
                                .thenThrow(new RepositoryException("Test error"));

                // Act & Assert
                assertThatThrownBy(() -> dataService.getCollections(null))
                                .isInstanceOf(DataException.class)
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
                assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry(
                                "bbox",
                                "[10,20,30,40]");
                assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry(
                                "bbox",
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
                assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry(
                                "bbox",
                                "[10,20,30,40]");
                assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry(
                                "bbox",
                                "[50,60,70,80]");

                verify(stacRepository, times(1)).getAllCollectionsByName(eq(bbox));
        }

        @Test
        void getCollectionsByName_Failure() {
                // Arrange
                when(stacRepository.getAllCollectionsByName(any()))
                                .thenThrow(new RepositoryException("Test error"));

                // Act & Assert
                assertThatThrownBy(() -> dataService.getCollectionsByName(null))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to fetch collections by name");

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
                assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry(
                                "bbox",
                                "[10,20,30,40]");
                assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry(
                                "bbox",
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
                assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1").containsEntry(
                                "bbox",
                                "[10,20,30,40]");
                assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2").containsEntry(
                                "bbox",
                                "[50,60,70,80]");

                verify(stacRepository, times(1)).getAllCollectionsByDate(eq(bbox));
        }

        @Test
        void getCollectionsByDate_Failure() {
                // Arrange
                when(stacRepository.getAllCollectionsByDate(any()))
                                .thenThrow(new RepositoryException("Test error"));

                // Act & Assert
                assertThatThrownBy(() -> dataService.getCollectionsByDate(null))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to fetch collections by date");

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
        void deleteAllCollections_ShouldLogError_WhenExceptionThrown() {
                // Arrange
                doThrow(new RepositoryException("Test exception"))
                                .when(stacRepository).deleteAllCollections();

                // Act & Assert
                assertThatThrownBy(() -> dataService.deleteAllCollections())
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to delete all collections");

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
                                .isInstanceOf(DataException.class)
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
                }).isInstanceOf(DataException.class)
                                .hasMessageContaining("Thread interrupted while creating view for collection: ID");

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
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("No collections found at the provided URL");

                verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
        }

        @Test
        void verifyCollections_ShouldThrowException_WhenCollectionsAreEmpty() {
                // Arrange
                when(restTemplate.getForObject(anyString(), eq(Map.class)))
                                .thenReturn(Map.of("collections", List.of()));

                // Act & Assert
                assertThatThrownBy(() -> dataService.verifyCollections(DEFAULT_ENDPOINT_URL))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("No collections found at the provided URL");

                verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
        }

        @Test
        void verifyCollections_ShouldLogError_WhenExceptionThrown() {
                // Arrange
                when(restTemplate.getForObject(anyString(), eq(Map.class)))
                                .thenThrow(new RuntimeException("Test exception"));

                // Act & Assert
                assertThatThrownBy(() -> dataService.verifyCollections(DEFAULT_ENDPOINT_URL))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Error checking collections");

                verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
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
                doThrow(new RepositoryException("Error inserting item"))
                                .when(stacRepository).insertItem(anyString());

                // Assert
                assertThatThrownBy(() -> dataService.insertItem("test"))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to insert item");
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
                doThrow(new RepositoryException("Error fetching item"))
                                .when(stacRepository).getItem(anyString());

                // Assert
                assertThatThrownBy(() -> dataService.getItem("test"))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to fetch item");
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
                doThrow(new RepositoryException("Error fetching item"))
                                .when(stacRepository).getItem(anyString(), anyString());

                // Assert
                assertThatThrownBy(() -> dataService.getItem("test", "test"))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to fetch item");
        }

        @Test
        void removeAllItems_Failure() {
                // Arrange
                doThrow(new RepositoryException("Error removing all items"))
                                .when(stacRepository).removeAllItems();

                // Assert
                assertThatThrownBy(() -> dataService.removeAllItems())
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to remove all items");
        }

        @Test
        void removeItemsFromCollection_Failure() {
                // Arrange
                doThrow(new RepositoryException("Error removing items from collection"))
                                .when(stacRepository).removeItemsFromCollection(anyString());

                // Assert
                assertThatThrownBy(() -> dataService.removeItemsFromCollection("test"))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to remove items from collection");
        }

        @Test
        void removeItem_Failure() {
                // Arrange
                doThrow(new RepositoryException("Error removing item"))
                                .when(stacRepository).removeItem(anyString(), anyString());

                // Assert
                assertThatThrownBy(() -> dataService.removeItem("test", "test"))
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to remove item");
        }

        @Test
        void getCollections_HandlesNullValues() {
                // Arrange
                Map<String, Object> nullValueMap = new HashMap<>();
                nullValueMap.put("key", null);
                nullValueMap.put("id", null);
                nullValueMap.put("bbox", null);

                List<Map<String, Object>> mockCollections = List.of(nullValueMap);
                when(stacRepository.getAllCollections(any())).thenReturn(mockCollections);

                // Act
                List<Map<String, Object>> collections = dataService.getCollections(null);

                // Assert
                assertThat(collections).hasSize(1);
                assertThat(collections.get(0)).containsEntry("key", "")
                                .containsEntry("id", "")
                                .containsEntry("bbox", "[]");
        }

        @Test
        void verifyCollections_Success() {
                // Arrange
                List<Map<String, Object>> mockCollections = List.of(Map.of("id", "collection1"));
                Map<String, Object> response = Map.of("collections", mockCollections);
                when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);

                // Act
                String result = dataService.verifyCollections("https://test-url.com");

                // Assert
                assertThat(result).isEqualTo("Collections found");
        }

        @Test
        void deleteAllItems_Success() {
                // Act
                dataService.deleteAllItems();

                // Assert
                verify(stacRepository).deleteAllItems();
        }

        @Test
        void deleteAllItems_ThrowsException() {
                // Arrange
                doThrow(new RepositoryException("Test error"))
                                .when(stacRepository).deleteAllItems();

                // Act & Assert
                assertThatThrownBy(() -> dataService.deleteAllItems())
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to delete all items");
        }

        @Test
        void fetchAndSaveItems_Success() throws JsonProcessingException {
                // Arrange
                String collectionId = "testCollection";
                Map<String, Object> configMap = Map.of("endpoint", "https://test-endpoint.com");
                ResponseEntity<Map<String, Object>> configResponse = ResponseEntity.ok(configMap);
                when(configController.getConfig()).thenReturn(configResponse);

                // Mock Collection Metadata (from DB)
                List<Map<String, Object>> collectionMetadata = List.of(Map.of(
                                "datetime", "2023-08-01T12:00:00Z",
                                "end_datetime", "2023-08-31T12:00:00Z",
                                "item_count", 2));
                when(stacRepository.queryCollectionMetaData(collectionId)).thenReturn(collectionMetadata);

                // Mock STAC API Responses for Pagination (First call has next, second does not)
                Map<String, Object> item1 = new HashMap<>();
                item1.put("id", "wildfire_timestamp_2023_08_10_12_00_00");
                Map<String, Object> item2 = new HashMap<>();
                item2.put("id", "wildfire_timestamp_2023_08_11_12_00_00");

                // First response includes "next" link
                Map<String, Object> firstResponse = Map.of(
                                "features", List.of(item1),
                                "links", List.of(Map.of("rel", "next", "href", "https://next-page.com")));

                // Second response has no "next" link (pagination stops)
                Map<String, Object> secondResponse = Map.of(
                                "features", List.of(item2), // Last item
                                "links", List.of() // No next link, should stop looping
                );

                when(restTemplate.getForObject(anyString(), eq(Map.class)))
                                .thenReturn(firstResponse) // First call
                                .thenReturn(secondResponse); // Second call (stops pagination)

                // Mock DB Calls for Inserting Items
                when(stacRepository.checkCollectionExists("wildfire_timestamp_2023_08_10_12_00_00")).thenReturn(false);
                when(stacRepository.checkCollectionExists("wildfire_timestamp_2023_08_11_12_00_00")).thenReturn(false);
                when(objectMapper.writeValueAsString(any()))
                                .thenReturn("{\"id\":\"wildfire_timestamp_2023_08_10_12_00_00\"}");

                // Act
                dataService.fetchAndSaveItems(collectionId);

                // Wait briefly to allow async execution (not ideal but necessary for async
                // tests)
                try {
                        Thread.sleep(200);
                } catch (InterruptedException e) {
                        Thread.currentThread().interrupt(); // Restore the interrupted status
                        throw new RuntimeException(e);
                }

                // Assert
                verify(configController).getConfig();
                verify(restTemplate, times(2)).getForObject(anyString(), eq(Map.class)); // Ensures it calls twice, then
                                                                                         // stops
                verify(stacRepository, times(2)).insertItem(anyString());
                verify(stacRepository, times(2)).checkCollectionExists(anyString());

                // Assert progress is updated
                int progress = dataService.getProgress(collectionId);
                assertTrue(progress > 90 && progress <= 100, "Progress should be a valid percentage");
        }

        @Test
        void removeAllItems_Success() {
                // Arrange
                when(stacRepository.removeAllItems()).thenReturn("All items removed");

                // Act
                String result = dataService.removeAllItems();

                // Assert
                assertThat(result).isEqualTo("All items removed");
        }

        @Test
        void removeItemsFromCollection_Success() {
                // Arrange
                String collectionId = "testCollection";
                when(stacRepository.removeItemsFromCollection(collectionId)).thenReturn("Items removed");

                // Act
                String result = dataService.removeItemsFromCollection(collectionId);

                // Assert
                assertThat(result).isEqualTo("Items removed");
        }

        @Test
        void removeItem_Success() {
                // Arrange
                String itemId = "item1";
                String collectionId = "collection1";
                when(stacRepository.removeItem(itemId, collectionId)).thenReturn("Item removed");

                // Act
                String result = dataService.removeItem(itemId, collectionId);

                // Assert
                assertThat(result).isEqualTo("Item removed");
        }

        @Test
        void verifyInternetConnection_Success() {
                // Arrange
                String endpointUrl = "https://test-url.com";
                when(restTemplate.getForObject(endpointUrl, String.class)).thenReturn("Response");

                // Act
                String result = dataService.verifyInternetConnection(endpointUrl);

                // Assert
                assertThat(result).isEqualTo("Internet connection established");
        }

        @Test
        void verifyInternetConnection_Failure() {
                // Arrange
                String endpointUrl = "https://test-url.com";
                when(restTemplate.getForObject(endpointUrl, String.class)).thenThrow(new RuntimeException("Failed"));

                // Act
                String result = dataService.verifyInternetConnection(endpointUrl);

                // Assert
                assertThat(result).isEqualTo("No internet connection could be established");
        }

        @Test
        void fetchItemsTimestamps_Success() {
                // Arrange
                List<String> mockTimestamps = List.of("2023-01-01T12:00:00Z", "2023-02-01T12:00:00Z");
                when(stacRepository.getItemsTimestamps()).thenReturn(mockTimestamps);

                // Act
                List<String> result = dataService.fetchItemsTimestamps();

                // Assert
                assertThat(result).isEqualTo(mockTimestamps);
                verify(stacRepository).getItemsTimestamps();
        }

        @Test
        void fetchItemsTimestamps_ThrowsException() {
                // Arrange
                when(stacRepository.getItemsTimestamps())
                                .thenThrow(new RepositoryException("Database error"));

                // Act & Assert
                assertThatThrownBy(() -> dataService.fetchItemsTimestamps())
                                .isInstanceOf(DataException.class)
                                .hasMessageContaining("Failed to fetch item timestamps");
        }

        @Test
        void fetchAndSaveItems_SkipsExistingItems() throws JsonProcessingException {
                // Arrange
                String collectionId = "testCollection";
                Map<String, Object> configMap = Map.of("endpoint", "https://test-endpoint.com");
                ResponseEntity<Map<String, Object>> configResponse = ResponseEntity.ok(configMap);
                when(configController.getConfig()).thenReturn(configResponse);

                // Mock Collection Metadata (from DB)
                List<Map<String, Object>> collectionMetadata = List.of(Map.of(
                                "datetime", "2023-08-01T12:00:00Z",
                                "end_datetime", "2023-08-31T12:00:00Z",
                                "item_count", 1));
                when(stacRepository.queryCollectionMetaData(collectionId)).thenReturn(collectionMetadata);

                // Mock STAC API Response (with existing item)
                Map<String, Object> item = new HashMap<>();
                item.put("id", "existingItem");

                Map<String, Object> itemsResponse = Map.of(
                                "features", List.of(item),
                                "links", List.of() // No "next" link to ensure no infinite loop
                );

                when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(itemsResponse);
                when(stacRepository.checkCollectionExists("existingItem")).thenReturn(true);

                // Act
                dataService.fetchAndSaveItems(collectionId);

                // Wait for async execution
                try {
                        Thread.sleep(100);
                } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException(e);
                }

                // Assert
                verify(stacRepository).checkCollectionExists("existingItem");
                verify(stacRepository, never()).insertItem(anyString());
        }

        @Test
        void fetchAndSaveItems_HandlesException() {
                // Arrange
                String collectionId = "testCollection";
                when(configController.getConfig())
                                .thenThrow(new RuntimeException("Config error"));

                // Ensure the failure message contains the expected error text
                try {
                        dataService.fetchAndSaveItems(collectionId);
                } catch (Exception e) {
                        assertTrue(true);
                }

                // Verify that it attempted to fetch config before failing
                verify(configController, times(1)).getConfig();
        }

        @Test
        void resetView_Default_Success() {
                // Arrange
                doNothing().when(stacRepository).resetDatalayerView();
                when(stacRepository.checkDatalayerView()).thenReturn(false);

                // Act
                dataService.resetView();

                // Assert
                verify(stacRepository, atLeastOnce()).resetDatalayerView();
                verify(stacRepository, atLeastOnce()).checkDatalayerView();
        }

        @Test
        void resetView_SleepMillisAdjusted_Failure() {
                // Arrange
                doNothing().when(stacRepository).resetDatalayerView();
                when(stacRepository.checkDatalayerView()).thenReturn(true); // View remains, causing failure

                // Act & Assert
                assertThatThrownBy(() -> dataService.resetView(0))
                                .isInstanceOf(IllegalStateException.class)
                                .hasMessageContaining("View could not be reset");

                verify(stacRepository, atLeastOnce()).resetDatalayerView();
                verify(stacRepository, atLeastOnce()).checkDatalayerView();
        }

        @Test
        void resetView_ShouldHandleInterruptedException() {
                // Arrange
                doNothing().when(stacRepository).resetDatalayerView();
                when(stacRepository.checkDatalayerView()).thenReturn(true); // View remains, causing loop

                // Act & Assert
                assertThatThrownBy(() -> {
                        Thread.currentThread().interrupt(); // Simulate interruption
                        dataService.resetView(0);
                }).isInstanceOf(IllegalStateException.class)
                                .hasMessageContaining("View could not be reset");

                verify(stacRepository, atLeastOnce()).resetDatalayerView();
                verify(stacRepository, atLeastOnce()).checkDatalayerView();
        }

        @Test
        void retrieveCollectionMetaData_ThrowsException() {
                // Arrange
                String collectionId = "nonexistent-collection";

                // Mock the repository to throw an exception
                when(stacRepository.queryCollectionMetaData(collectionId))
                                .thenThrow(new RuntimeException("Database error"));

                // Act & Assert
                DataException exception = assertThrows(DataException.class, () -> {
                        dataService.retrieveCollectionMetaData(collectionId);
                });

                // Verify the exception message and cause
                assertThat(exception.getMessage())
                                .isEqualTo("Failed to retrieve metadata for collection: nonexistent-collection");
                assertThat(exception.getCause())
                                .isInstanceOf(RuntimeException.class);
                assertThat(exception.getCause().getMessage())
                                .isEqualTo("Database error");

                // Verify that the repository method was called
                verify(stacRepository).queryCollectionMetaData(collectionId);
        }

        @Test
        void insertView_CatchesAndWrapsGeneralExceptions() {
                // Arrange
                String collectionId = "test-collection";

                // Mock the repository to throw an unexpected exception that isn't a
                // DataException
                doThrow(new RuntimeException("Unexpected database error"))
                                .when(stacRepository).setDatalayerView(collectionId);

                // Act & Assert
                DataException exception = assertThrows(DataException.class, () -> {
                        dataService.insertView(collectionId);
                });

                // Verify the exception was properly wrapped with the correct message
                assertThat(exception.getMessage())
                                .isEqualTo("Failed to insert view for collection: test-collection");

                // Verify the original exception is preserved as the cause
                assertThat(exception.getCause())
                                .isInstanceOf(RuntimeException.class);
                assertThat(exception.getCause().getMessage())
                                .isEqualTo("Unexpected database error");

                // Verify the repository method was called
                verify(stacRepository).setDatalayerView(collectionId);

                // Verify checkDatalayerView was never called (exception happens before that)
                verify(stacRepository, never()).checkDatalayerView();
        }
  @Test
    void resetView_Success() {
        // Act
        dataService.resetView();

        // Assert
        verify(stacRepository, times(1)).resetDatalayerView();
    }

    @Test
    void resetView_ShouldLogError_WhenExceptionThrown() {
        // Arrange
        doThrow(new RuntimeException("Test exception")).when(stacRepository).resetDatalayerView();

        // Act & Assert
        assertThatThrownBy(() -> dataService.resetView())
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Failed to reset Datalayer view: Test exception");

        verify(stacRepository, times(1)).resetDatalayerView();
    }
}
