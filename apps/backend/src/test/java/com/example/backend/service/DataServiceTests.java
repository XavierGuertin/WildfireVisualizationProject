package com.example.backend.service;

import com.example.backend.repository.StacRepository;
import com.example.backend.service.DataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataServiceTests {

  @Mock
  private StacRepository stacRepository;

  @InjectMocks
  private DataService dataService;

  private String testCollectionJson;
  private String testCollectionId;

  @BeforeEach
  void setUp() {
    testCollectionId = "synthetic-wildfire-collection";
    testCollectionJson = """
                {
                    "id": "synthetic-wildfire-collection",
                    "type": "Collection"
                }
                """;
  }

  @Test
  void insertAndQueryCollection_NewCollection_Success() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    List<Map<String, Object>> mockResult = new ArrayList<>();
    Map<String, Object> mockData = new HashMap<>();
    mockData.put("id", testCollectionId);
    mockResult.add(mockData);
    when(stacRepository.queryCollection(anyString())).thenReturn(mockResult);

    // Act
    String result = dataService.insertAndQueryCollection(testCollectionJson);

    // Assert
    verify(stacRepository).insertCollection(anyString());
    assertThat(result).contains(testCollectionId);
  }

  @Test
  void insertAndQueryCollection_ExistingCollection_SkipsInsertion() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(true);
    List<Map<String, Object>> mockResult = new ArrayList<>();
    Map<String, Object> mockData = new HashMap<>();
    mockData.put("id", testCollectionId);
    mockResult.add(mockData);
    when(stacRepository.queryCollection(anyString())).thenReturn(mockResult);

    // Act
    String result = dataService.insertAndQueryCollection(testCollectionJson);

    // Assert
    verify(stacRepository, never()).insertCollection(anyString());
    assertThat(result).contains(testCollectionId);
  }

  @Test
  void insertAndQueryCollection_NoResults_ReturnsNotFound() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(new ArrayList<>());

    // Act
    String result = dataService.insertAndQueryCollection(testCollectionJson);

    // Assert
    assertThat(result).isEqualTo("Collection not found");
  }

  @Test
  void insertAndQueryCollection_RepositoryError_ThrowsException() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString()))
      .thenThrow(new RuntimeException("Test error"));

    // Act & Assert
    assertThatThrownBy(() -> dataService.insertAndQueryCollection(testCollectionJson))
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Failed to process collection");
  }

  @Test
  void insertAndQueryCollection_WithDefaultValues_Success() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    List<Map<String, Object>> mockResult = new ArrayList<>();
    Map<String, Object> mockData = new HashMap<>();
    mockData.put("id", "synthetic-wildfire-collection");
    mockResult.add(mockData);
    when(stacRepository.queryCollection(anyString())).thenReturn(mockResult);

    // Act
    String result = dataService.insertAndQueryCollection();

    // Assert
    verify(stacRepository).insertCollection(anyString());
    assertThat(result).contains("synthetic-wildfire-collection");
  }
}
