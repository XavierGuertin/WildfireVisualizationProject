package wildfire.visualization.backend.repository;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import wildfire.visualization.backend.exception.RepositoryException;

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
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Error checking if collection exists");
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
        .thenThrow(new DataAccessException("Database error") {
        });

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
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Error deleting all collections");
  }

  // =========================== FETCH COLLECTIONS BY NAME TESTS
  // ===========================

  @Test
  void getAllCollectionsByName_Success_NoBbox() {
    List<Map<String, Object>> mockResults = List.of(
        Map.of("title", "collection1"),
        Map.of("title", "collection2"));

    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByName(null, "asc");

    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("title", "collection1");
    verify(jdbcTemplate).queryForList(anyString());
  }

  @Test
  void getAllCollectionsByName_Success_WithBbox() {
    double[] bbox = { 10.0, 20.0, 30.0, 40.0 };
    List<Map<String, Object>> mockResults = List.of(
        Map.of("title", "collection1"),
        Map.of("title", "collection2"));

    when(jdbcTemplate.queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3])))
        .thenReturn(mockResults);

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByName(bbox, "asc");

    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("title", "collection1");
    verify(jdbcTemplate).queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3]));
  }

  @Test
  void getAllCollectionsByName_ThrowsException() {
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Database error") {
    });

    assertThatThrownBy(() -> stacRepository.getAllCollectionsByName(null, "asc"))
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

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByDate(null, "asc");

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

    List<Map<String, Object>> results = stacRepository.getAllCollectionsByDate(bbox, "asc");

    assertThat(results).hasSize(2);
    assertThat(results.get(0)).containsEntry("datetime", "2024-02-01T12:00:00Z");
    verify(jdbcTemplate).queryForList(anyString(), eq(bbox[0]), eq(bbox[1]), eq(bbox[2]), eq(bbox[3]));
  }

  @Test
  void getAllCollectionsByDate_ThrowsException() {
    when(jdbcTemplate.queryForList(anyString())).thenThrow(new DataAccessException("Database error") {
    });

    assertThatThrownBy(() -> stacRepository.getAllCollectionsByDate(null, "asc"))
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
        .hasMessageContaining("Error creating datalayer view for collection: ID");
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
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Error fetching items");
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
        .thenThrow(new DataAccessException("Database error") {
        });

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.checkItemExists(itemId))
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Error checking if item exists");
  }

  @Test
  void getAllCollections_ThrowsException_WithInvalidBboxLength() {
    // Arrange
    double[] invalidBbox = { 10.0, 20.0, 30.0 }; // Only 3 elements

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getAllCollections(invalidBbox))
        .isInstanceOf(RepositoryException.class)
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
    doThrow(new DataAccessException("Database error") {
    })
        .when(jdbcTemplate).update("DELETE FROM pgstac.items");

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.deleteAllItems())
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Error deleting all items");
  }

  @Test
  void checkItemExists_HandlesNullCount() {
    // Arrange
    String itemId = "test-item";
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), eq(itemId)))
        .thenReturn(null);

    // Act
    boolean result = stacRepository.checkItemExists(itemId);

    // Assert
    assertThat(result).isFalse();
  }

  @Test
  void fetchCollections_ThrowsException_WithInvalidOrderBy() {
    // Arrange
    String invalidOrderBy = "invalid_column";

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.fetchCollections(null, invalidOrderBy, "asc"))
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Invalid orderBy column");
  }

  @Test
  void fetchCollections_AcceptsValidOrderBy() {
    // Arrange
    List<Map<String, Object>> mockResults = new ArrayList<>();
    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResults);

    // Act - Should not throw exception
    stacRepository.fetchCollections(null, "id", "asc");
    stacRepository.fetchCollections(null, "datetime", "asc");

    // Assert
    verify(jdbcTemplate, times(2)).queryForList(anyString());
  }

  @Test
  void getItemsTimestamps_Success() {
    // Arrange
    List<String> expectedTimestamps = List.of("2023-01-01T12:00:00Z", "2023-01-02T12:00:00Z");
    when(jdbcTemplate.queryForList(anyString(), eq(String.class))).thenReturn(expectedTimestamps);

    // Act
    List<String> result = stacRepository.getItemsTimestamps();

    // Assert
    assertThat(result).isEqualTo(expectedTimestamps);
  }

  @Test
  void getItemsTimestamps_Failure() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString(), eq(String.class)))
        .thenThrow(new DataAccessException("Database error") {
        });

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getItemsTimestamps())
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error fetching item timestamps");
  }

  @Test
  void queryCollectionMetaData_ThrowsException_WhenDatabaseError() {
    // Arrange
    String collectionId = "test-collection";

    // Use doThrow() syntax which handles overloaded methods better
    doThrow(new DataAccessException("Database error") {
    })
        .when(jdbcTemplate).queryForList(anyString(), eq("test-collection"));

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.queryCollectionMetaData(collectionId))
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Error querying metadata for collection: test-collection");
  }

  @Test
  void resetDatalayerView_Success() {
    // Arrange
    doNothing().when(jdbcTemplate).execute(anyString());

    // Act
    stacRepository.resetDatalayerView();

    // Assert
    verify(jdbcTemplate, times(1)).execute("DROP VIEW IF EXISTS Datalayer");
  }

  @Test
  void resetDatalayerView_ThrowsException_WhenDatabaseError() {
    // Arrange
    doThrow(new DataAccessException("Database error") {
    }).when(jdbcTemplate).execute(anyString());

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.resetDatalayerView())
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Error resetting Datalayer view");
  }

  @Test
  void testSaveLayer_insertsCollectionItemAndAsset() {
    stacRepository.saveLayer("item1", "col1", "asset1", "url1", 0, 100);

    verify(jdbcTemplate).update(contains("INSERT INTO TIFF_Collections"), eq("col1"));
    verify(jdbcTemplate).update(contains("INSERT INTO TIFF_Items"), eq("item1"), eq("col1"));
    verify(jdbcTemplate).update(contains("INSERT INTO TIFF_Assets"), eq("item1"), eq("asset1"), eq("url1"), eq(0), eq(100));
  }

  @Test
  void testGetLoadedLayers_returnsList() {
    List<Map<String, Object>> mockResult = List.of(Map.of("asset_name", "asset1"));
    when(jdbcTemplate.queryForList(anyString(), eq("item1"))).thenReturn(mockResult);

    List<Map<String, Object>> result = stacRepository.getLoadedLayers("item1");

    assertThat(result).hasSize(1);
    assertThat(result.get(0).get("asset_name")).isEqualTo("asset1");
  }

  @Test
  void testClearLayers_deletesAllTables() {
    stacRepository.clearLayers();

    verify(jdbcTemplate).update("DELETE FROM TIFF_Assets");
    verify(jdbcTemplate).update("DELETE FROM TIFF_Items");
    verify(jdbcTemplate).update("DELETE FROM TIFF_Collections");
  }

  @Test
  void testGetItemsWithAssets_returnsList() {
    List<Map<String, Object>> mockResult = List.of(Map.of("item_id", "item1"));
    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResult);

    List<Map<String, Object>> result = stacRepository.getItemsWithAssets();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).get("item_id")).isEqualTo("item1");
  }

  @Test
  void testDeleteItemAssetLayer_executesDelete() {
    stacRepository.deleteItemAssetLayer("asset1", "item1");

    verify(jdbcTemplate).update("DELETE FROM TIFF_Assets WHERE asset_name = ? AND item_id = ?", "asset1", "item1");
  }

  @Test
  void testMarkAssetAsRegistered_executesUpdate() {
    stacRepository.markAssetAsRegistered("item1", "asset1");

    verify(jdbcTemplate).update("UPDATE TIFF_Assets SET is_registered = TRUE WHERE item_id = ? AND asset_name = ?",
        "item1", "asset1");
  }

  @Test
  void testMarkAssetAsUnregistered_executesUpdate() {
    stacRepository.markAssetAsUnregistered("item1", "asset1");

    verify(jdbcTemplate).update("UPDATE TIFF_Assets SET is_registered = FALSE WHERE item_id = ? AND asset_name = ?",
        "item1", "asset1");
  }

  @Test
  void testDeleteItem_executesDelete() {
    stacRepository.deleteItem("item1");

    verify(jdbcTemplate).update("DELETE FROM TIFF_Items WHERE item_id = ?", "item1");
  }

  @Test
  void testGetLoadedLayersRegistered_returnsList() {
    List<Map<String, Object>> mockResult = List.of(Map.of("is_registered", true));
    when(jdbcTemplate.queryForList(anyString())).thenReturn(mockResult);

    List<Map<String, Object>> result = stacRepository.getLoadedLayers();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).get("is_registered")).isEqualTo(true);
  }

  @Test
  void getItemsIdsOrderedByTimestamp_Success() {
    // Arrange
    List<String> expectedIds = List.of("item1", "item2", "item3");
    when(jdbcTemplate.queryForList(anyString(), eq(String.class))).thenReturn(expectedIds);

    // Act
    List<String> result = stacRepository.getItemsIdsOrderedByTimestamp();

    // Assert
    assertThat(result).isEqualTo(expectedIds);
    verify(jdbcTemplate).queryForList("SELECT id FROM pgstac.items ORDER BY datetime AT TIME ZONE 'UTC' ASC",
        String.class);
  }

  @Test
  void getItemsIdsOrderedByTimestamp_ThrowsRepositoryException_OnDatabaseError() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString(), eq(String.class)))
        .thenThrow(new DataAccessException("Simulated DB error") {
        });

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getItemsIdsOrderedByTimestamp())
        .isInstanceOf(RepositoryException.class)
        .hasMessageContaining("Error fetching item IDs");

    verify(jdbcTemplate).queryForList(anyString(), eq(String.class));
  }

  @Test
  void getAllItems_returnsItemsForCollection() {
    // Arrange
    String collectionId = "montreal_2023";
    Map<String, Object> item = Map.of(
      "id", "wildfire_timestamp_2023_08_30_12_00_00",
      "collection", collectionId
    );
    List<Map<String, Object>> mockResults = List.of(item);

    when(jdbcTemplate.queryForList(anyString(), eq(collectionId))).thenReturn(mockResults);

    // Act
    List<Map<String, Object>> result = stacRepository.getAllItemsFromCollection(collectionId);

    // Assert
    assertThat(result).hasSize(1);
    assertThat(result.get(0).get("id")).isEqualTo("wildfire_timestamp_2023_08_30_12_00_00");
    assertThat(result.get(0).get("collection")).isEqualTo(collectionId);
  }

  @Test
  void getAllItems_throwsRepositoryException_onJdbcError() {
    // Arrange
    when(jdbcTemplate.queryForList(anyString(), Optional.ofNullable(any())))
      .thenThrow(new DataAccessException("Simulated DB error") {});

    // Act & Assert
    assertThatThrownBy(() -> stacRepository.getAllItemsFromCollection("any_collection"))
      .isInstanceOf(RepositoryException.class)
      .hasMessageContaining("Error fetching items");
  }


}
