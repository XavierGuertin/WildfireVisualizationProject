package wildfire.visualization.backend.helper;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

class UtilHelperTests {

  private Map<String, Object> responseWithNextLink;
  private Map<String, Object> responseWithoutNextLink;
  private List<Map<String, Object>> sampleDbMetadata;

  @BeforeEach
  void setUp() {
    responseWithNextLink = new HashMap<>();
    List<Map<String, Object>> links = new ArrayList<>();
    links.add(Map.of("rel", "next", "href", "https://example.com/next?page=2"));
    responseWithNextLink.put("links", links);

    responseWithoutNextLink = new HashMap<>();
    responseWithoutNextLink.put("links", Collections.emptyList());

    sampleDbMetadata = new ArrayList<>();
    sampleDbMetadata.add(Map.of(
      "datetime", "2023-08-01T12:00:00Z",
      "end_datetime", "2023-08-31T12:00:00Z"
    ));
  }

  @Test
  void testExtractNextUrl_whenNextExists() {
    assertEquals("https://example.com/next?page=2", UtilHelper.extractNextUrl(responseWithNextLink));
  }

  @Test
  void testExtractNextUrl_whenNoNextExists() {
    assertNull(UtilHelper.extractNextUrl(responseWithoutNextLink));
  }

  @Test
  void testExtractNextUrl_whenLinksIsNull() {
    assertNull(UtilHelper.extractNextUrl(Collections.emptyMap()));
  }

  @Test
  void testExtractTimestampISO_validId() {
    assertEquals("2023-08-20T12:00:00Z", UtilHelper.extractTimestampISO("wildfire_timestamp_2023_08_20_12_00_00"));
  }

  @Test
  void testCalculateProgress_validData() {
    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);
    LocalDateTime current = LocalDateTime.of(2023, 8, 15, 12, 0, 0);

    assertEquals(50.0, UtilHelper.calculateProgress(current, start, end), 10.0);
  }

  @Test
  void testCalculateProgress_nullCurrent() {
    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);
    assertEquals(0.0, UtilHelper.calculateProgress(null, start, end));
  }

  @Test
  void testCalculateProgress_outOfBounds() {
    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);
    LocalDateTime beforeStart = LocalDateTime.of(2023, 7, 31, 12, 0, 0);
    LocalDateTime afterEnd = LocalDateTime.of(2023, 9, 1, 12, 0, 0);

    assertTrue(UtilHelper.calculateProgress(beforeStart, start, end) < 0);
    assertTrue(UtilHelper.calculateProgress(afterEnd, start, end) > 100);
  }

  @Test
  void testComputeProgressFromItems_validItems() {
    List<Map<String, Object>> items = List.of(Map.of("id", "wildfire_timestamp_2023_08_15_12_00_00"));

    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);

    assertEquals(50.0, UtilHelper.computeProgressFromItems(items, start, end), 10);
  }

  @Test
  void testComputeProgressFromItems_emptyList() {
    assertEquals(0.0, UtilHelper.computeProgressFromItems(Collections.emptyList(),
      LocalDateTime.of(2023, 8, 1, 12, 0, 0),
      LocalDateTime.of(2023, 8, 31, 12, 0, 0)));
  }

  @Test
  void testExtractTemporalStartFromDB_validTimestamp() {
    List<Map<String, Object>> metadata = List.of(Map.of("datetime", Timestamp.valueOf("2023-08-01 12:00:00")));
    assertEquals("2023-08-01T12:00:00", UtilHelper.extractTemporalStartFromDB(metadata).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
  }

  @Test
  void testExtractTemporalStartFromDB_validString() {
    assertEquals("2023-08-01T12:00:00", UtilHelper.extractTemporalStartFromDB(sampleDbMetadata).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
  }

  @Test
  void testExtractTemporalStartFromDB_unexpectedType() {
    List<Map<String, Object>> metadata = List.of(Map.of("datetime", 12345));
    assertNull(UtilHelper.extractTemporalStartFromDB(metadata));
  }

  @Test
  void testExtractTemporalStartFromDB_emptyList() {
    assertNull(UtilHelper.extractTemporalStartFromDB(Collections.emptyList()));
  }

  @Test
  void testExtractTemporalEndFromDB_validTimestamp() {
    List<Map<String, Object>> metadata = List.of(Map.of("end_datetime", Timestamp.valueOf("2023-08-31 12:00:00")));
    assertEquals("2023-08-31T12:00:00", UtilHelper.extractTemporalEndFromDB(metadata).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
  }

  @Test
  void testExtractTemporalEndFromDB_validString() {
    assertEquals("2023-08-31T12:00:00", UtilHelper.extractTemporalEndFromDB(sampleDbMetadata).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
  }

  @Test
  void testExtractTemporalEndFromDB_unexpectedType() {
    List<Map<String, Object>> metadata = List.of(Map.of("end_datetime", 12345));
    assertNull(UtilHelper.extractTemporalEndFromDB(metadata));
  }

  @Test
  void testExtractTemporalEndFromDB_emptyList() {
    assertNull(UtilHelper.extractTemporalEndFromDB(Collections.emptyList()));
  }
}
