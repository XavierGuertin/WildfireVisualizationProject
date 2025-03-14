package wildfire.visualization.backend.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.Base64;
import java.util.Map;

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

  private final RestTemplate restTemplate = new RestTemplate();

  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    String auth = geoserverUsername + ":" + geoserverPassword;
    headers.setBasicAuth(Base64.getEncoder().encodeToString(auth.getBytes()));
    return headers;
  }

  public boolean registerCoverageStore(String layerName) {
    String url = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores";

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

  public boolean registerCoverageLayer(String layerName) {
    String url = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores/" + layerName + "/coverages";

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

  public boolean unregisterLayer(String layerName) {
    String url = geoserverUrl + "/rest/layers/" + workspace + ":" + layerName;
    return sendDeleteRequest(url);
  }

  public boolean deleteCoverageStore(String storeName) {
    String url = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores/" + storeName + "?purge=all&recurse=true";
    return sendDeleteRequest(url);
  }

  private boolean sendDeleteRequest(String url) {
    HttpHeaders headers = new HttpHeaders();
    headers.setBasicAuth(geoserverUsername, geoserverPassword);
    HttpEntity<String> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
    return response.getStatusCode().is2xxSuccessful();
  }
}
