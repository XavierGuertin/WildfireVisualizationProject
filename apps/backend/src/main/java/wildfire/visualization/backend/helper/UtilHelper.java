package wildfire.visualization.backend.helper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * Utility class for helper methods.
 */
public class UtilHelper {
  private static final Logger logger = LoggerFactory.getLogger(UtilHelper.class);
  private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss");

  // Prevent instantiation (Utility class)
  private UtilHelper() {}

  /**
   * Extracts the 'next' pagination URL from the API response.
   */
  public static String extractNextUrl(Map<String, Object> response) {
    List<Map<String, Object>> links = (List<Map<String, Object>>) response.get("links");
    if (links != null) {
      return links.stream()
        .filter(link -> "next".equals(link.get("rel")))
        .map(link -> link.get("href").toString())
        .findFirst()
        .orElse(null);
    }
    return null;
  }

  /**
   * Parses a timestamp from an item ID.
   */
  public static LocalDateTime extractTimestampFromId(String id) {
    return parseTimestamp(id.replace("wildfire_timestamp_", "").replace("_", "-"));
  }

  /**
   * Extracts the timestamp from an item ID and returns it in ISO format.
   */
  public static String extractTimestampISO(String id) {
    LocalDateTime dateTime = parseTimestamp(id.replace("wildfire_timestamp_", "").replace("_", "-"));
    return dateTime != null ? dateTime.atZone(ZoneId.of("UTC")).format(DateTimeFormatter.ISO_INSTANT) : null;
  }

  /**
   * Extracts the temporal start timestamp from the DB metadata.
   */
  public static LocalDateTime extractTemporalStartFromDB(List<Map<String, Object>> metadata) {
    return extractTemporalTimestamp(metadata, "datetime");
  }

  /**
   * Extracts the temporal end timestamp from the DB metadata.
   */
  public static LocalDateTime extractTemporalEndFromDB(List<Map<String, Object>> metadata) {
    return extractTemporalTimestamp(metadata, "end_datetime");
  }

  /**
   * Computes the progress percentage based on the first item's timestamp.
   */
  public static double computeProgressFromItems(List<Map<String, Object>> items, LocalDateTime start, LocalDateTime end) {
    if (items.isEmpty()) return 0.0;
    return calculateProgress(extractTimestampFromId((String) items.get(0).get("id")), start, end);
  }

  /**
   * Calculates the progress percentage based on time range.
   */
  public static double calculateProgress(LocalDateTime current, LocalDateTime start, LocalDateTime end) {
    if (current == null || start == null || end == null) return 0.0;
    long totalDuration = ChronoUnit.SECONDS.between(start, end);
    long elapsedDuration = ChronoUnit.SECONDS.between(start, current);
    return totalDuration > 0 ? (elapsedDuration * 100.0) / totalDuration : 0.0;
  }

  /**
   * Extracts a timestamp from the database metadata.
   */
  private static LocalDateTime extractTemporalTimestamp(List<Map<String, Object>> metadata, String key) {
    try {
      if (metadata.isEmpty()) return null;
      Object datetimeObj = metadata.get(0).get(key);
      if (datetimeObj instanceof Timestamp) {
        return ((Timestamp) datetimeObj).toLocalDateTime();
      } else if (datetimeObj instanceof String) {
        return LocalDateTime.parse((String) datetimeObj, DateTimeFormatter.ISO_DATE_TIME);
      }
    } catch (Exception e) {
      logger.warn("Failed to extract timestamp from DB metadata ({})", key, e);
    }
    return null;
  }

  /**
   * Parses a timestamp string into LocalDateTime.
   */
  private static LocalDateTime parseTimestamp(String timestampStr) {
    try {
      return LocalDateTime.parse(timestampStr, TIMESTAMP_FORMATTER);
    } catch (Exception e) {
      logger.warn("Failed to parse timestamp: {}", timestampStr, e);
      return null;
    }
  }
}
