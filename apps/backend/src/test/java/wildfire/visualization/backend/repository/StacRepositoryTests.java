package wildfire.visualization.backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
        anyString());
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
  void queryCollectionMetaData_ReturnsResults() {
    // Arrange
    List<Map<String, Object>> expectedResults = new ArrayList<>();
    Map<String, Object> result = new HashMap<>();
    result.put("id", testCollectionId);
    expectedResults.add(result);

    when(jdbcTemplate.queryForList(anyString(), anyString()))
        .thenReturn(expectedResults);

    // Act
    List<Map<String, Object>> actualResults = stacRepository.queryCollectionMetaData(testCollectionId);

    // Assert
    assertThat(actualResults).hasSize(1);
    assertThat(actualResults.get(0))
        .containsKey("id")
        .hasFieldOrPropertyWithValue("id", testCollectionId);
  }

  @Test
  void queryCollection_ThrowsException_WhenDatabaseError() {
    // Arrange
    String collectionId = "test-collection";
    when(jdbcTemplate.queryForList(anyString(), eq(collectionId)))
      .thenThrow(new DataAccessException("Database error") {});

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.queryCollection(collectionId))
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error querying collection");
  }

  @Test
  void fetchCollections_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "collection1"),
        Map.of("id", "collection2"));
    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    // Act
    List<Map<String, Object>> results = stacRepository.getAllCollections(null);

    // Assert
    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("id", "collection1");
    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void fetchCollections_Success_WithBbox() {
    // Arrange
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "collection1"),
        Map.of("id", "collection2"));

    when(jdbcTemplate.queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3])))
        .thenReturn(mockResults);

    // Act
    List<Map<String, Object>> results = stacRepository.getAllCollections(bbox);

    // Assert
    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("id", "collection1");
    verify(jdbcTemplate).queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3]));
  }

  @Test
  void fetchCollections_ThrowsException_WhenDatabaseError() {
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Database error") {
    });

    assertThatThrownBy(() -> stacRepository.getAllCollections(null))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching collections");

    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void getAllCollections_Success_NoBbox() {
    // Arrange
    List<Map<String, Object>> mockResults = List.of(
        Map.of("key", "value1", "id", "id1"),
        Map.of("key", "value2", "id", "id2"));

    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    // Act
    List<Map<String, Object>> results = stacRepository.getAllCollections(null);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("key", "value1").containsEntry("id", "id1");
    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void getAllCollections_Success_WithValidBbox() {
    // Arrange
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockResults = List.of(
        Map.of("key", "value3", "id", "id3"),
        Map.of("key", "value4", "id", "id4"));

    when(jdbcTemplate.queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3])))
        .thenReturn(mockResults);

    // Act
    List<Map<String, Object>> results = stacRepository.getAllCollections(bbox);

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("key", "value3").containsEntry("id", "id3");
    verify(jdbcTemplate).queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3]));
  }

  @Test
  void getAllCollections_Failure_NoBbox() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Database error") {
    });

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getAllCollections(null))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching collections");

    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void getAllCollections_Failure_WithBbox() {
    // Arrange
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    when(jdbcTemplate.queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3])))
        .thenThrow(new DataAccessException("Database error") {
        });

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getAllCollections(bbox))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching collections");

    verify(jdbcTemplate).queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3]));
  }

  @Test
  void deleteAllCollections_Success() {
    // Act
    stacRepository.deleteAllCollections();

    // Assert
    verify(jdbcTemplate, times(1)).update("DELETE FROM pgstac.datalayer");
    verify(jdbcTemplate, times(1)).update("DELETE FROM pgstac.collections");
  }

  @Test
  void insertCollection_ThrowsException_WhenDatabaseError() {
    // Arrange
    doThrow(new DataAccessException("Database error") {
    }).when(jdbcTemplate).queryForObject(anyString(), any(Class.class), anyString());

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.insertCollection(testCollectionJson))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error inserting collection");
  }

  @Test
  void deleteAllCollections_ThrowsException_WhenDatabaseError() {
    // Arrange
    doThrow(new DataAccessException("Database error") {
    }).when(jdbcTemplate).update(anyString());

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.deleteAllCollections())
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error deleting collections");
  }

  // =========================== FETCH COLLECTIONS BY NAME TESTS
  // ===========================

  @Test
  void getAllCollectionsByName_Success_NoBbox() {
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "collection1"),
        Map.of("id", "collection2"));

    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByName(null);

    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("id", "collection1");
    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void getAllCollectionsByName_Success_WithBbox() {
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "collection1"),
        Map.of("id", "collection2"));

    when(jdbcTemplate.queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3])))
        .thenReturn(mockResults);

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByName(bbox);

    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("id", "collection1");
    verify(jdbcTemplate).queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3]));
  }

  @Test
  void getAllCollectionsByName_ThrowsException() {
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Database error") {
    });

    assertThatThrownBy(() -> stacRepository.getAllCollectionsByName(null))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching collections");

    verify(jdbcTemplate).queryForList(anyString());
  }

  // =========================== FETCH COLLECTIONS BY DATE TESTS
  // ===========================

  @Test
  void getAllCollectionsByDate_Success_NoBbox() {
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "collection1", "datetime", "2024-02-01T12:00:00Z"),
        Map.of("id", "collection2", "datetime", "2024-02-02T12:00:00Z"));

    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByDate(null);

    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("datetime", "2024-02-01T12:00:00Z");
    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void getAllCollectionsByDate_Success_WithBbox() {
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "collection1", "datetime", "2024-02-01T12:00:00Z"),
        Map.of("id", "collection2", "datetime", "2024-02-02T12:00:00Z"));

    when(jdbcTemplate.queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3])))
        .thenReturn(mockResults);

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByDate(bbox);

    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("datetime", "2024-02-01T12:00:00Z");
    verify(jdbcTemplate).queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3]));
  }

  @Test
  void getAllCollectionsByDate_ThrowsException() {
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Database error") {
    });

    assertThatThrownBy(() -> stacRepository.getAllCollectionsByDate(null))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching collections");

    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void setDatalayerView_Success() {
    // Arrange
    doNothing().when(jdbcTemplate).execute(anyString());

    // Act
    stacRepository.setDatalayerView(testCollectionId);

    // Assert
    verify(jdbcTemplate, times(1)).execute("DROP VIEW IF EXISTS Datalayer");
    verify(jdbcTemplate, times(1)).execute("CREATE VIEW DataLayer AS" +
        " SELECT geometry FROM pgstac.collections WHERE id = '" + testCollectionId.replace("'", "''") + "'");
  }

  @Test
  void setDatalayerView_ThrowsException_WhenDatabaseError() {
    // Arrange
    doThrow(new DataAccessException("Database error") {
    }).when(jdbcTemplate).execute(anyString());

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.setDatalayerView("ID"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error inserting view");
  }

  @Test
  void checkDatalayerView_True_Success() {
    // Arrange
    String sql = "SELECT COUNT(*) FROM DataLayer";
    when(jdbcTemplate.queryForObject(sql, Integer.class)).thenReturn(1);

    // Act
    boolean result = stacRepository.checkDatalayerView();

    // Assert
    assertThat(result).isTrue();
  }

  @Test
  void checkDatalayerView_False_Success() {
    // Arrange
    String sql = "SELECT COUNT(*) FROM DataLayer";
    when(jdbcTemplate.queryForObject(sql, Integer.class)).thenReturn(0);

    // Act
    boolean result = stacRepository.checkDatalayerView();

    // Assert
    assertThat(result).isFalse();
  }

  @Test
  void checkDatalayerView_ThrowsException_WhenEmptyResultDataAccessExceptionError() {
    // Arrange
    String sql = "SELECT COUNT(*) FROM DataLayer";
    doThrow(new EmptyResultDataAccessException(1)).when(jdbcTemplate).queryForObject(sql, Integer.class);
    // Act & Assert
    boolean result = stacRepository.checkDatalayerView();

    // Assert
    assertThat(result).isFalse();
  }

  @Test
  void checkDatalayerView_ThrowsException_WhenDataAccessExceptionError() {
    // Arrange
    String sql = "SELECT COUNT(*) FROM DataLayer";
    doThrow(new DataAccessException("Database error") {
    }).when(jdbcTemplate).queryForObject(sql, Integer.class);

    // Act & Assert
    boolean result = stacRepository.checkDatalayerView();

    // Assert
    assertThat(result).isFalse();
  }

  @Test
  void getAllItems_Success() {
    // Arrange
    List<Map<String, Object>> mockResults = List.of(
        Map.of("id", "testCollection1", "name", "Test Collection 1"),
        Map.of("id", "testCollection2", "name", "Test Collection 2"));
    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    // Act
    List<Map<String, Object>> results = stacRepository.getAllItems("");

    // Assert
    assertThat(results).isNotNull();
    assertThat(results).hasSize(2);
    assertThat(results).isEqualTo(mockResults);
  }

  @Test
  void getAllItems_Failure() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Error fetching all items") {
    });

    // Assert
    assertThatThrownBy(() -> stacRepository.getAllItems(""))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching all items");
  }

  @Test
  void getItem_WithId_Success() {

    // Arrange
    List<Map<String, Object>> results = List.of(
        Map.of("id", "testId", "name", "Test Name"));
    when(jdbcTemplate.queryForList(anyString())).thenReturn(results);

    // Act
    List<Map<String, Object>> result = stacRepository.getItem(anyString());

    // Assert
    assertThat(result).hasSize(1);
    assertThat(result).isEqualTo(results);
  }

  @Test
  void getItem_WithId_Failure() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Error fetching all items") {
    });

    // Assert
    assertThatThrownBy(() -> stacRepository.getItem("test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching item");
  }

  @Test
  void getItem_WithIdAndCollectionId_Success() {

    // Arrange
    List<Map<String, Object>> results = List.of(
        Map.of("id", "testId", "name", "Test Name"));
    when(jdbcTemplate.queryForList(anyString())).thenReturn(results);

    // Act
    List<Map<String, Object>> result = stacRepository.getItem("test", "test");

    // Assert
    assertThat(result).hasSize(1);
    assertThat(result).isEqualTo(results);
  }

  @Test
  void getItem_WithIdAndCollectionId_Failure() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Error fetching item") {
    });

    // Assert
    assertThatThrownBy(() -> stacRepository.getItem("test", "test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching item");
  }

  @Test
  void removeAllItems_Success() {
    // Arrange
    String expected = "Successfully Removed All Items";

    doNothing().when(jdbcTemplate).execute(anyString());
    // Act
    String result = stacRepository.removeAllItems();
    // Assert
    assertThat(result).isEqualTo(expected);
  }

  @Test
  void removeAllItems_Failure() {
    // Arrange
    doThrow(new DataAccessException("Error removing all items") {
    }).when(jdbcTemplate).execute(anyString());

    // Assert
    assertThatThrownBy(() -> stacRepository.removeAllItems())
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error removing all items");

  }

  @Test
  void removeItemsFromCollection_Success() {
    // Arrange
    String expected = "Successfully Removed All Items From Collection";

    doNothing().when(jdbcTemplate).execute(anyString());
    // Act
    String result = stacRepository.removeItemsFromCollection("Test");
    // Assert
    assertThat(result).isEqualTo(expected);
  }

  @Test
  void removeItemsFromCollection_Failure() {
    // Arrange
    doThrow(new DataAccessException("Error removing items from collection") {
    }).when(jdbcTemplate).execute(anyString());

    // Assert
    assertThatThrownBy(() -> stacRepository.removeItemsFromCollection("test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error removing items from collection");
  }

  @Test
  void removeItem_Success() {
    // Arrange
    String expected = "Successfully Removed Item";

    doNothing().when(jdbcTemplate).execute(anyString());
    // Act
    String result = stacRepository.removeItem("Test", "Test");
    // Assert
    assertThat(result).isEqualTo(expected);
  }

  @Test
  void removeItem_Failure() {
    // Arrange
    doThrow(new DataAccessException("Error removing item") {
    }).when(jdbcTemplate).execute(anyString());

    // Assert
    assertThatThrownBy(() -> stacRepository.removeItem("test", "test"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error removing item");
  }

  @Test
  void insertItem_Success() {
    // Arrange
    when(jdbcTemplate.queryForObject(anyString(), any(Class.class), anyString())).thenReturn("");
    // Act
    stacRepository.insertItem("Test");
  }

  @Test
  void insertItem_Failure() {
    // Arrange
    doThrow(new DataAccessException("Error inserting item") {
    }).when(jdbcTemplate).queryForObject(anyString(), any(Class.class), anyString());

    // Assert
    assertThatThrownBy(() -> stacRepository.insertItem("{id: 'test'}"))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error inserting item");
  }

  @Test
  void checkItemExists_ReturnsTrueWhenExists() {
    // Arrange
    String itemId = "test-item";
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq(itemId)))
      .thenReturn(1);

    // Act
    boolean result = stacRepository.checkItemExists(itemId);

    // Assert
    assertThat(result).isTrue();
    verify(jdbcTemplate).queryForObject(
      eq("SELECT COUNT(*) FROM pgstac.items WHERE id = ?"),
      eq(Integer.class),
      eq(itemId));
  }

  @Test
  void checkItemExists_ReturnsFalseWhenDoesNotExist() {
    // Arrange
    String itemId = "test-item";
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq(itemId)))
      .thenReturn(0);

    // Act
    boolean result = stacRepository.checkItemExists(itemId);

    // Assert
    assertThat(result).isFalse();
  }

  @Test
  void checkItemExists_ThrowsException_WhenDatabaseError() {
    // Arrange
    String itemId = "test-item";
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq(itemId)))
      .thenThrow(new DataAccessException("Database error") {});

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.checkItemExists(itemId))
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error checking item existence");
  }

  @Test
  void getAllCollections_ThrowsException_WithInvalidBboxLength() {
    // Arrange
    double[] invalidBbox = {10.0, 20.0, 30.0}; // Only 3 elements

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getAllCollections(invalidBbox))
      .isInstanceOf(IllegalArgumentException.class)
      .hasMessage("Bounding box must have exactly 4 elements (minX, minY, maxX, maxY)");
  }

  @Test
  void deleteAllItems_Success() {
    // Act
    stacRepository.deleteAllItems();

    // Assert
    verify(jdbcTemplate).update("DELETE FROM pgstac.items");
  }

  @Test
  void deleteAllItems_ThrowsException_WhenDatabaseError() {
    // Arrange
    doThrow(new DataAccessException("Database error") {})
      .when(jdbcTemplate).update("DELETE FROM pgstac.items");

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.deleteAllItems())
      .isInstanceOf(RuntimeException.class)
      .hasMessageContaining("Error deleting items");
  }
}
