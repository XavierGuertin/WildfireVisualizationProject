package wildfire.visualization.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class GeoServerService {

  @Value("${geoserver.url}")
  private String geoserverUrl;

  @Value("${geoserver.workspace}")
  private String workspace;

  @Value("${geoserver.username}")
  private String geoserverUsername;

  @Value("${geoserver.password}")
  private String geoserverPassword;

  @Value("${geoserver.dataDir}")
  private String geoserverDataDir;

  @Value("${geoserver.downloadDir}")
  private String geoserverDownloadDir;

  @Value("${geoserver.workspacesPath}")
  private String geoserverWorkspacesPath;

  private final RestTemplate restTemplate = new RestTemplate();

  private static final Logger logger = LoggerFactory.getLogger(GeoServerService.class);

  /**
   * Creates and returns HTTP headers with basic authentication for GeoServer
   * interaction.
   *
   * @return HttpHeaders object with content type set to JSON and basic
   *         authentication included.
   */
  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBasicAuth(geoserverUsername, geoserverPassword);
    return headers;
  }

  /**
   * Registers a new coverage store in the GeoServer under the specified
   * workspace.
   *
   * @param layerName the name of the coverage store to be registered
   * @return true if the registration was successful, false otherwise
   */
  public boolean registerCoverageStore(String layerName) {
    String url = geoserverUrl + geoserverWorkspacesPath + workspace + "/coveragestores";

    String body = """
            {
              "coverageStore": {
                "name": "%s",
                "type": "GeoTIFF",
                "url": "file:%s/%s.tif",
                "workspace": "%s",
                "enabled": true
              }
            }
        """.formatted(layerName, geoserverDataDir, layerName, workspace);

    HttpEntity<String> entity = new HttpEntity<>(body, createHeaders());
    ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

    return response.getStatusCode().is2xxSuccessful();
  }

  /**
   * Registers a new coverage layer in the GeoServer under the specified workspace
   * and coverage store.
   *
   * @param layerName the name of the layer to be registered
   * @return true if the registration was successful, false otherwise
   */
  public boolean registerCoverageLayer(String layerName) {
    String url = geoserverUrl + geoserverWorkspacesPath + workspace + "/coveragestores/" + layerName + "/coverages";

    String body = """
            {
              "coverage": {
                "name": "%s",
                "title": "%s",
                "nativeCRS": "EPSG:4326",
                "srs": "EPSG:4326"
              }
            }
        """.formatted(layerName, layerName);

    HttpEntity<String> entity = new HttpEntity<>(body, createHeaders());
    ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

    return response.getStatusCode().is2xxSuccessful();
  }

  /**
   * Removes a registered layer from the GeoServer within the specified workspace.
   * Also deletes the corresponding .tif file from local storage.
   *
   * @param layerName the name of the layer to be unregistered
   * @return true if the layer was successfully unregistered, false otherwise
   */
  public boolean unregisterLayer(String layerName) {
    String url = geoserverUrl + geoserverWorkspacesPath + workspace + "/coveragestores/" + layerName
        + "?purge=all&recurse=true";

    try {
      boolean apiSuccess = sendDeleteRequest(url);
      return apiSuccess;
    } catch (Exception e) {
      logger.error("Error unregistering layer: " + layerName + ". " + e.getMessage());
      return false;
    }
  }

  /**
   * Sends a DELETE request to the specified URL with basic authentication.
   *
   * @param url the URL to send the DELETE request to
   * @return true if the request was successful, false otherwise
   */
  private boolean sendDeleteRequest(String url) {
    HttpHeaders headers = createHeaders();
    HttpEntity<String> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
    return response.getStatusCode().is2xxSuccessful();
  }

  /**
   * Deletes the .tif file corresponding to a given layer or store from the local
   * storage.
   *
   * @param layerName the name of the file to be deleted (without extension)
   */
  public void deleteTifFile(String layerName) {
    try {
      Path filePath = Paths.get(geoserverDownloadDir, layerName + ".tif");
      if (Files.exists(filePath)) {
        Files.delete(filePath);
        logger.info("Deleted: " + filePath.toAbsolutePath());
      } else {
        logger.error("File not found: " + filePath.toAbsolutePath());
      }
    } catch (Exception e) {
      logger.error("Error deleting file: " + layerName + ".tif. " + e.getMessage());
    }
  }
}
