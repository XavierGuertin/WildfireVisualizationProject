package wildfire.visualization.backend.helper;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

class UtilHelperTest {

  private Map<String, Object> responseWithNextLink;
  private Map<String, Object> responseWithoutNextLink;
  private List<Map<String, Object>> sampleDbMetadata;

  @BeforeEach
  void setUp() {
    // Mock API response with "next" link
    responseWithNextLink = new HashMap<>();
    List<Map<String, Object>> links = new ArrayList<>();
    links.add(Map.of("rel", "next", "href", "https://example.com/next?page=2"));
    responseWithNextLink.put("links", links);

    // Mock API response without "next" link
    responseWithoutNextLink = new HashMap<>();
    responseWithoutNextLink.put("links", Collections.emptyList());

    // Mock DB metadata response
    sampleDbMetadata = new ArrayList<>();
    sampleDbMetadata.add(Map.of(
      "datetime", "2023-08-01T12:00:00Z",
      "end_datetime", "2023-08-31T12:00:00Z"
    ));
  }

  @Test
  void testExtractNextUrl_whenNextExists() {
    String nextUrl = UtilHelper.extractNextUrl(responseWithNextLink);
    assertNotNull(nextUrl);
    assertEquals("https://example.com/next?page=2", nextUrl);
  }

  @Test
  void testExtractNextUrl_whenNoNextExists() {
    String nextUrl = UtilHelper.extractNextUrl(responseWithoutNextLink);
    assertNull(nextUrl);
  }

  @Test
  void testExtractTimestampISO_validId() {
    String id = "wildfire_timestamp_2023_08_20_12_00_00";
    String expectedTimestamp = "2023-08-20T12:00:00Z";

    String extractedTimestamp = UtilHelper.extractTimestampISO(id);
    assertEquals(expectedTimestamp, extractedTimestamp);
  }

  @Test
  void testExtractTimestampISO_invalidId() {
    String invalidId = "wildfire_timestamp_invalid_data";
    String extractedTimestamp = UtilHelper.extractTimestampISO(invalidId);
    assertNull(extractedTimestamp);
  }

  @Test
  void testCalculateProgress_validData() {
    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);
    LocalDateTime current = LocalDateTime.of(2023, 8, 15, 12, 0, 0);

    double progress = UtilHelper.calculateProgress(current, start, end);
    // expect a +/- 10% margin of error
    assertEquals(50.0, progress, 10.0);
  }

  @Test
  void testCalculateProgress_nullCurrent() {
    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);

    double progress = UtilHelper.calculateProgress(null, start, end);
    assertEquals(0.0, progress);
  }

  @Test
  void testComputeProgressFromItems_validItems() {
    List<Map<String, Object>> items = new ArrayList<>();
    items.add(Map.of("id", "wildfire_timestamp_2023_08_15_12_00_00"));

    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);

    double progress = UtilHelper.computeProgressFromItems(items, start, end);
    assertEquals(50.0, progress, 10);
  }

  @Test
  void testComputeProgressFromItems_emptyList() {
    List<Map<String, Object>> items = new ArrayList<>();
    LocalDateTime start = LocalDateTime.of(2023, 8, 1, 12, 0, 0);
    LocalDateTime end = LocalDateTime.of(2023, 8, 31, 12, 0, 0);

    double progress = UtilHelper.computeProgressFromItems(items, start, end);
    assertEquals(0.0, progress);
  }

  @Test
  void testExtractTemporalStartFromDB_validData() {
    LocalDateTime extractedStart = UtilHelper.extractTemporalStartFromDB(sampleDbMetadata);
    assertNotNull(extractedStart);
    assertEquals("2023-08-01T12:00:00", extractedStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
  }

  @Test
  void testExtractTemporalStartFromDB_emptyList() {
    List<Map<String, Object>> emptyMetadata = new ArrayList<>();
    LocalDateTime extractedStart = UtilHelper.extractTemporalStartFromDB(emptyMetadata);
    assertNull(extractedStart);
  }

  @Test
  void testExtractTemporalEndFromDB_validData() {
    LocalDateTime extractedEnd = UtilHelper.extractTemporalEndFromDB(sampleDbMetadata);
    assertNotNull(extractedEnd);
    assertEquals("2023-08-31T12:00:00", extractedEnd.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
  }

  @Test
  void testExtractTemporalEndFromDB_emptyList() {
    List<Map<String, Object>> emptyMetadata = new ArrayList<>();
    LocalDateTime extractedEnd = UtilHelper.extractTemporalEndFromDB(emptyMetadata);
    assertNull(extractedEnd);
  }
}
