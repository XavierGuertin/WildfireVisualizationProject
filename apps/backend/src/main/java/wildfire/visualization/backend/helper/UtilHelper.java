package wildfire.visualization.backend.helper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import java.time.ZoneId;

/**
 * Utility class for helper methods.
 */

public class UtilHelper {
  private static final Logger logger = LoggerFactory.getLogger(UtilHelper.class);

  // Prevent instantiation (Utility class)
  private UtilHelper() {}

  /**
   * Extracts the 'next' pagination URL from the API response.
   */
  public static String extractNextUrl(Map<String, Object> response) {
    List<Map<String, Object>> links = (List<Map<String, Object>>) response.get("links");
    if (links != null) {
      for (Map<String, Object> link : links) {
        if ("next".equals(link.get("rel"))) {
          return link.get("href").toString();
        }
      }
    }
    return null;
  }

  /**
   * Parses the timestamp from an item ID (e.g., "wildfire_timestamp_2023_08_20_12_00_00").
   */
  public static LocalDateTime extractTimestampFromId(String id) {
    try {
      String timestampStr = id.replace("wildfire_timestamp_", "").replace("_", "-");
      return LocalDateTime.parse(timestampStr, DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss"));
    } catch (Exception e) {
      logger.warn("Failed to parse timestamp from id: {}", id);
      return null;
    }
  }

  /**
   * Extracts the timestamp from an item ID and returns it in ISO format.
   */
  public static String extractTimestampISO(String id) {
    try {
      String timestampStr = id.replace("wildfire_timestamp_", "").replace("_", "-");
      LocalDateTime dateTime = LocalDateTime.parse(timestampStr, DateTimeFormatter.ofPattern("yyyy-MM-dd-HH-mm-ss"));
      return dateTime.atZone(ZoneId.of("UTC")).format(DateTimeFormatter.ISO_INSTANT);
    } catch (Exception e) {
      logger.warn("Failed to parse timestamp from id: {}", id);
      return null;
    }
  }

  /**
   * Extracts the temporal start timestamp from the DB metadata.
   */
  public static LocalDateTime extractTemporalStartFromDB(List<Map<String, Object>> metadata) {
    try {
      if (metadata.isEmpty()) return null;

      Object datetimeObj = metadata.get(0).get("datetime");

      if (datetimeObj instanceof Timestamp) {
        return ((Timestamp) datetimeObj).toLocalDateTime();
      } else if (datetimeObj instanceof String) {
        return LocalDateTime.parse((String) datetimeObj, DateTimeFormatter.ISO_DATE_TIME);
      } else {
        logger.warn("Unexpected datetime format: {}", datetimeObj);
        return null;
      }
    } catch (Exception e) {
      logger.warn("Failed to extract start timestamp from DB metadata: {}", e.getMessage());
      return null;
    }
  }


  /**
   * Extracts the temporal end timestamp from the DB metadata.
   */
  public static LocalDateTime extractTemporalEndFromDB(List<Map<String, Object>> metadata) {
    try {
      if (metadata.isEmpty()) return null;

      Object datetimeObj = metadata.get(0).get("end_datetime");

      if (datetimeObj instanceof Timestamp) {
        return ((Timestamp) datetimeObj).toLocalDateTime();
      } else if (datetimeObj instanceof String) {
        return LocalDateTime.parse((String) datetimeObj, DateTimeFormatter.ISO_DATE_TIME);
      } else {
        logger.warn("Unexpected datetime format: {}", datetimeObj);
        return null;
      }
    } catch (Exception e) {
      logger.warn("Failed to extract end timestamp from DB metadata: {}", e.getMessage());
      return null;
    }
  }

  /**
   * Computes the progress percentage based on the first item's timestamp.
   */
  public static double computeProgressFromItems(List<Map<String, Object>> items, LocalDateTime start, LocalDateTime end) {
    if (items.isEmpty()) return 0.0;

    // Extract first item's timestamp
    String firstItemId = (String) items.get(0).get("id");
    LocalDateTime firstItemDate = extractTimestampFromId(firstItemId);

    return calculateProgress(firstItemDate, start, end);
  }

  /**
   * Calculates the progress percentage based on time range.
   */
  public static double calculateProgress(LocalDateTime current, LocalDateTime start, LocalDateTime end) {
    if (current == null) return 0.0;

    long totalDuration = ChronoUnit.SECONDS.between(start, end);
    long elapsedDuration = ChronoUnit.SECONDS.between(start, current);

    return (elapsedDuration * 100.0) / totalDuration;
  }

}
