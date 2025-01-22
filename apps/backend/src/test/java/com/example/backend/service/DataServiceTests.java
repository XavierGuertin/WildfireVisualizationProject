package com.example.backend.service;

import com.example.backend.repository.StacRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataServiceTests {

  @Mock
  private StacRepository stacRepository;

  @Mock
  private RestTemplate restTemplate;

  @InjectMocks
  private DataService dataService;

  private Map<String, Object> mockResponse;

  @BeforeEach
  void setUp() {
    mockResponse = new HashMap<>();
    mockResponse.put("collections", List.of(new HashMap<>()));
  }

  @Test
  void fetchAndSaveCollections_ShouldFetchAndSaveCollections() {
    // Arrange
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockResponse);

    // Act
    dataService.fetchAndSaveCollections();

    // Assert
    verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    verify(stacRepository, times(1)).insertCollection(anyString());
  }

  @Test
  void fetchAndSaveCollections_ShouldLogError_WhenExceptionThrown() {
    // Arrange
    when(restTemplate.getForObject(anyString(), eq(Map.class))).thenThrow(new RuntimeException("Test exception"));

    // Act & Assert
    try {
      dataService.fetchAndSaveCollections();
    } catch (Exception e) {
      // Expected exception
    }

    verify(restTemplate, times(1)).getForObject(anyString(), eq(Map.class));
    verify(stacRepository, times(0)).insertCollection(anyString());
  }

  @Test
  void insertAndQueryCollection_DefaultParams() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));

    // Act
    String result = dataService.insertAndQueryCollection();

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(1)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }

  @Test
  void insertAndQueryCollection_WithCollectionJson() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));

    // Act
    String result = dataService.insertAndQueryCollection("{\"id\":\"test\"}");

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(1)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }

  @Test
  void insertAndQueryCollection_WithCollectionJsonAndId() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(false);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));

    // Act
    String result = dataService.insertAndQueryCollection("{\"id\":\"test\"}", "test-id");

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(1)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }

  @Test
  void insertAndQueryCollection_CollectionExists() {
    // Arrange
    when(stacRepository.checkCollectionExists(anyString())).thenReturn(true);
    when(stacRepository.queryCollection(anyString())).thenReturn(List.of(new HashMap<>()));

    // Act
    String result = dataService.insertAndQueryCollection("{\"id\":\"test\"}", "test-id");

    // Assert
    verify(stacRepository, times(1)).checkCollectionExists(anyString());
    verify(stacRepository, times(0)).insertCollection(anyString());
    verify(stacRepository, times(1)).queryCollection(anyString());
    assertThat(result).isNotNull();
  }
}
