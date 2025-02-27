package wildfire.visualization.backend.controller;

import wildfire.visualization.backend.service.ConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for handling configuration settings.
 */
@RestController
public class ConfigController {
  private static final Logger logger = LoggerFactory.getLogger(ConfigController.class);

  @Autowired
  private ConfigService configService;

  @GetMapping("/api/config")
  public ResponseEntity<Map<String, Object>> getConfig() {
    logger.info("Received request to /api/config");
    try {
      Map<String, Object> config = configService.getConfig();
      return ResponseEntity.ok(config);
    } catch (Exception e) {
      logger.error("Error getting config: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @PostMapping("/api/config")
  public ResponseEntity<Void> saveConfig(@RequestBody Map<String, Object> config) {
    logger.info("Received request to save config");
    try {
      configService.saveConfig(config);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      logger.error("Error saving config: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().build();
    }
  }
}
