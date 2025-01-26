package com.example.backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StacRepositoryTests {

  @Mock
  private JdbcTemplate jdbcTemplate;

  @InjectMocks
  private StacRepository stacRepository;

  private String testCollectionId;
  private String testCollectionJson;

  @BeforeEach
  void setUp() {
    testCollectionId = "test-collection";
    testCollectionJson = """
      {
          "id": "test-collection",
          "type": "Collection"
      }
      """;
  }

  @Test
  void checkCollectionExists_ReturnsTrueWhenExists() {
    when(jdbcTemplate.queryForObject(anyString(), any(Class.class), anyString()))
      .thenReturn(1);

    boolean result = stacRepository.checkCollectionExists(testCollectionId);

    assertThat(result).isTrue();
  }

  @Test
  void checkCollectionExists_ReturnsFalseWhenDoesNotExist() {
    when(jdbcTemplate.queryForObject(anyString(), any(Class.class), anyString()))
      .thenReturn(0);

    boolean result = stacRepository.checkCollectionExists(testCollectionId);

    assertThat(result).isFalse();
  }

  @Test
  void checkCollectionExists_ThrowsException_WhenDatabaseError() {
    when(jdbcTemplate.queryForObject(anyString(), any(Class.class), anyString()))
      .thenThrow(new DataAccessException("Database error") {
      });

    assertThatThrownBy(() -> stacRepository.checkCollectionExists(testCollectionId))
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error checking collection existence");
  }

  @Test
  void insertCollection_Success() {
    when(jdbcTemplate.queryForObject(anyString(), any(Class.class), anyString()))
      .thenReturn(new Object());

    stacRepository.insertCollection(testCollectionJson);

    verify(jdbcTemplate).queryForObject(
      anyString(),
      any(Class.class),
      anyString()
    );
  }

  @Test
  void queryCollection_ReturnsResults() {
    List<Map<String, Object>> expectedResults = new ArrayList<>();
    Map<String, Object> result = new HashMap<>();
    result.put("id", testCollectionId);
    expectedResults.add(result);

    when(jdbcTemplate.queryForList(anyString(), anyString()))
      .thenReturn(expectedResults);

    List<Map<String, Object>> actualResults = stacRepository.queryCollection(testCollectionId);

    assertThat(actualResults).hasSize(1);
    assertThat(actualResults.get(0))
      .containsKey("id")
      .hasFieldOrPropertyWithValue("id", testCollectionId);
  }

  @Test
  void queryMetaData_ReturnsResults() {
    //Arrange
    List<Map<String, Object>> expectedResults = new ArrayList<>();
    Map<String, Object> result = new HashMap<>();
    result.put("id", testCollectionId);
    expectedResults.add(result);

    when(jdbcTemplate.queryForList(anyString(), anyString()))
      .thenReturn(expectedResults);

    //Act
    List<Map<String, Object>> actualResults = stacRepository.queryMetaData(testCollectionId);

    //Assert
    assertThat(actualResults).hasSize(1);
    assertThat(actualResults.get(0))
      .containsKey("id")
      .hasFieldOrPropertyWithValue("id", testCollectionId);
  }

  @Test
  void queryCollection_ThrowsException_WhenDatabaseError() {
    when(jdbcTemplate.queryForList(anyString(), anyString()))
      .thenThrow(new DataAccessException("Database error") {
      });

    assertThatThrownBy(() -> stacRepository.queryCollection(testCollectionId))
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error querying collection");
  }

  @Test
  void getAllCollections_Success() {
    // Arrange
    List<Map<String, Object>> mockResults = List.of(
      Map.of("key", "value1", "id", "id1"),
      Map.of("key", "value2", "id", "id2")
    );
    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    // Act
    List<Map<String, Object>> results = stacRepository.getAllCollections();

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("key", "value1").containsEntry("id", "id1");
  }

  @Test
  void getAllCollections_Failure() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Database error") {
    });

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getAllCollections())
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error fetching all collections");
  }

  @Test
  void deleteAllCollections_Success() {
    // Act
    stacRepository.deleteAllCollections();

    // Assert
    verify(jdbcTemplate, times(1)).update("DELETE FROM pgstac.collections");
  }

  @Test
  void insertCollection_ThrowsException_WhenDatabaseError() {
    // Arrange
    doThrow(new DataAccessException("Database error") {}).when(jdbcTemplate).queryForObject(anyString(), any(Class.class), anyString());

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.insertCollection(testCollectionJson))
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error inserting collection");
  }

  @Test
  void deleteAllCollections_ThrowsException_WhenDatabaseError() {
    // Arrange
    doThrow(new DataAccessException("Database error") {}).when(jdbcTemplate).update(anyString());

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.deleteAllCollections())
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error deleting collections");
  }
}
