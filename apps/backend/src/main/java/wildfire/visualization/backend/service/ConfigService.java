package wildfire.visualization.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * Service to handle reading and writing configurations to a file.
 */
@Service
public class ConfigService {
  private static final Logger logger = LoggerFactory.getLogger(ConfigService.class);
  private static final String CONFIG_FILE_PATH = System.getenv().getOrDefault("CONFIG_FILE_PATH",
      "config/app-config.json");
  private final ObjectMapper objectMapper;

  public ConfigService(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  /**
   * Method responsible for retrieving the user configuration
   *
   * @return Map object containing the key value pairs of the user configuration
   */
  public Map<String, Object> getConfig() {
    try {
      File configFile = new File(CONFIG_FILE_PATH);
      if (configFile.exists()) {
        return objectMapper.readValue(configFile, Map.class);
      } else {
        return Map.of();
      }
    } catch (IOException e) {
      logger.error("Error reading config file: {}", e.getMessage(), e);
      throw new RuntimeException("Error reading config file", e);
    }
  }

  /**
   * Method responsible for saving user configuration
   *
   * @param config Map object containing the key value pairs of the user configuration
   */
  public void saveConfig(Map<String, Object> config) {
    try {
      objectMapper.writeValue(new File(CONFIG_FILE_PATH), config);
    } catch (IOException e) {
      logger.error("Error writing config file: {}", e.getMessage(), e);
      throw new RuntimeException("Error writing config file", e);
    }
  }
}
