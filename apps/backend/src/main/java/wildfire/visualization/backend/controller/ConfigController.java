package wildfire.visualization.backend.controller;

import wildfire.visualization.backend.service.ConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for handling configuration settings.
 */
@RestController
public class ConfigController {
  private static final Logger logger = LoggerFactory.getLogger(ConfigController.class);

  private final ConfigService configService;

  public ConfigController(ConfigService configService) {
    this.configService = configService;
  }

  @GetMapping("/api/config")
  public ResponseEntity<Map<String, Object>> getConfig() {
    logger.info("Received request to /api/config");
    Map<String, Object> config = configService.getConfig();
    return ResponseEntity.ok(config);
  }

  @PostMapping("/api/config")
  public ResponseEntity<Void> saveConfig(@RequestBody Map<String, Object> config) {
    logger.info("Received request to save config");
    configService.saveConfig(config);
    return ResponseEntity.ok().build();
  }
}