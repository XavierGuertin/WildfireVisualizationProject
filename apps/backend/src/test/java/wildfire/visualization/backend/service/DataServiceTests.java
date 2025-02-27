package wildfire.visualization.backend.service;

import com.example.backend.repository.StacRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import wildfire.visualization.backend.repository.StacRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.*;
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
    void getCollections_Success() {
        // Arrange
        List<Map<String, Object>> mockCollections = List.of(
                Map.of("key", "value1", "id", "id1"),
                Map.of("key", "value2", "id", "id2"));
        when(stacRepository.getAllCollections()).thenReturn(mockCollections);

        // Act
        List<Map<String, Object>> collections = dataService.getCollections();

        // Assert
        assertThat(collections).isNotNull().hasSize(2);
        assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1");
    }

    @Test
    void getCollections_Failure() {
        // Arrange
        when(stacRepository.getAllCollections()).thenThrow(new RuntimeException("Test error"));

        // Act & Assert
        assertThatThrownBy(() -> dataService.getCollections())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to fetch collections");
    }

    @Test
    void getCollectionsByName_Success() {
        // Arrange
        List<Map<String, Object>> mockCollections = List.of(
                Map.of("key", "value1", "id", "id1"),
                Map.of("key", "value2", "id", "id2"));
        when(stacRepository.getAllCollectionsByName()).thenReturn(mockCollections);

        // Act
        List<Map<String, Object>> collections = dataService.getCollectionsByName();

        // Assert
        assertThat(collections).isNotNull();
        assertThat(collections).hasSize(2);
        assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1");
        assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2");
        verify(stacRepository, times(1)).getAllCollectionsByName();
    }

    @Test
    void getCollectionsByName_Failure() {
        // Arrange
        when(stacRepository.getAllCollectionsByName()).thenThrow(new RuntimeException("Test error"));

        // Act & Assert
        assertThatThrownBy(() -> dataService.getCollectionsByName())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to fetch collections");

        verify(stacRepository, times(1)).getAllCollectionsByName();
    }

    @Test
    void getCollectionsByDate_Success() {
        // Arrange
        List<Map<String, Object>> mockCollections = List.of(
                Map.of("key", "value1", "id", "id1"),
                Map.of("key", "value2", "id", "id2"));
        when(stacRepository.getAllCollectionsByDate()).thenReturn(mockCollections);

        // Act
        List<Map<String, Object>> collections = dataService.getCollectionsByDate();

        // Assert
        assertThat(collections).isNotNull();
        assertThat(collections).hasSize(2);
        assertThat(collections.get(0)).containsEntry("key", "value1").containsEntry("id", "id1");
        assertThat(collections.get(1)).containsEntry("key", "value2").containsEntry("id", "id2");
        verify(stacRepository, times(1)).getAllCollectionsByDate();
    }

    @Test
    void getCollectionsByDate_Failure() {
        // Arrange
        when(stacRepository.getAllCollectionsByDate()).thenThrow(new RuntimeException("Test error"));

        // Act & Assert
        assertThatThrownBy(() -> dataService.getCollectionsByDate())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to fetch collections");

        verify(stacRepository, times(1)).getAllCollectionsByDate();
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
    void insertItem_Success() {
        //Arrange
        doNothing().when(stacRepository).insertItem(anyString());
        //Act
        dataService.insertItem("Test");
    }

    @Test
    void insertItem_Failure() {
        //Arrange
        doThrow(new RuntimeException("Error fetching item")).when(stacRepository).insertItem(anyString());

        //Assert
        assertThatThrownBy(() -> dataService.insertItem("test"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error fetching item");
    }

    @Test
    void getAllItems_Success() {
        //Arrange
        List<Map<String, Object>> mockResults = List.of(
                Map.of("id", "test1"),
                Map.of("id", "test2")
        );
        when(stacRepository.getAllItems(anyString())).thenReturn(mockResults);
        //Act
        List<Map<String, Object>> result = dataService.getAllItems("Test");

        //Assert
        assertThat(result).isEqualTo(mockResults);
    }

    @Test
    void getAllItems_Failure() {
        //Arrange
        doThrow(new RuntimeException("Error fetching all items")).when(stacRepository).getAllItems(anyString());

        //Assert
        assertThatThrownBy(() -> dataService.getAllItems("test"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error fetching all items");
    }

    @Test
    void getItem_WithId_Success() {
        //Arrange
        List<Map<String, Object>> mockResults = List.of(
                Map.of("id", "test1")
        );
        when(stacRepository.getItem(anyString())).thenReturn(mockResults);
        //Act
        List<Map<String, Object>> result = dataService.getItem("Test");

        //Assert
        assertThat(result).isEqualTo(mockResults);
    }

    @Test
    void getItem_WithId_Failure() {
        //Arrange
        doThrow(new RuntimeException("Error fetching item")).when(stacRepository).getItem(anyString());

        //Assert
        assertThatThrownBy(() -> dataService.getItem("test"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error fetching item");
    }

    @Test
    void getItem_WithIdAndCollectionId_Success() {
        //Arrange
        List<Map<String, Object>> mockResults = List.of(
                Map.of("id", "test1")
        );
        when(stacRepository.getItem(anyString(), anyString())).thenReturn(mockResults);
        //Act
        List<Map<String, Object>> result = dataService.getItem("Test", "Test");

        //Assert
        assertThat(result).isEqualTo(mockResults);
    }

    @Test
    void getItem_WithIdAndCollectionId_Failure() {
        //Arrange
        doThrow(new RuntimeException("Error fetching item")).when(stacRepository).getItem(anyString(), anyString());

        //Assert
        assertThatThrownBy(() -> dataService.getItem("test", "test"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error fetching item");
    }

    @Test
    void removeAllItems_Success() {

    }

    @Test
    void removeAllItems_Failure() {
        //Arrange
        doThrow(new RuntimeException("Error removing all items")).when(stacRepository).removeAllItems();

        //Assert
        assertThatThrownBy(() -> dataService.removeAllItems())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error removing all items");
    }

    @Test
    void removeItemsFromCollection_Success() {

    }

    @Test
    void removeItemsFromCollection_Failure() {
        //Arrange
        doThrow(new RuntimeException("Error removing item")).when(stacRepository).removeItemsFromCollection(anyString());

        //Assert
        assertThatThrownBy(() -> dataService.removeItemsFromCollection("test"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error removing item");
    }

    @Test
    void removeItem_Success() {

    }

    @Test
    void removeItem_Failure() {
        //Arrange
        doThrow(new RuntimeException("Error removing item")).when(stacRepository).removeItem(anyString(), anyString());

        //Assert
        assertThatThrownBy(() -> dataService.removeItem("test", "test"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error removing item");
    }

}
