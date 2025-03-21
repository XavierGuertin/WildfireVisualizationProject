package wildfire.visualization.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class GeoServerServiceTests {

  @Mock
  private RestTemplate restTemplate;

  @InjectMocks
  private GeoServerService geoServerService;

  @TempDir
  Path tempDir;

  private final String geoserverUrl = "http://localhost:8090/geoserver";
  private final String workspace = "Default";
  private final String username = "admin";
  private final String password = "geoserver";
  private final String geoserverDataDir = "/var/geoserver/data_dir/tiffs";
  private final String layerName = "humidity";

  @BeforeEach
  void setUp() {
    setField(geoServerService, "geoserverUrl", geoserverUrl);
    setField(geoServerService, "workspace", workspace);
    setField(geoServerService, "geoserverUsername", username);
    setField(geoServerService, "geoserverPassword", password);
    setField(geoServerService, "geoserverDataDir", geoserverDataDir);
    setField(geoServerService, "restTemplate", restTemplate);
  }

  @Test
  void testRegisterCoverageStore_Success() {
    String expectedUrl = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores";

    // Mock response
    ResponseEntity<String> successResponse = new ResponseEntity<>("Created", HttpStatus.CREATED);
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
      .thenReturn(successResponse);

    // Execute
    boolean result = geoServerService.registerCoverageStore(layerName);

    // Verify
    verify(restTemplate, times(1)).exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    assertThat(result).isTrue();
  }

  @Test
  void testRegisterCoverageStore_Failure() {
    String expectedUrl = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores";

    // Mock response
    ResponseEntity<String> failureResponse = new ResponseEntity<>("Error", HttpStatus.BAD_REQUEST);
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
      .thenReturn(failureResponse);

    // Execute
    boolean result = geoServerService.registerCoverageStore(layerName);

    // Verify
    verify(restTemplate, times(1)).exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    assertThat(result).isFalse();
  }

  @Test
  void testRegisterCoverageLayer_Success() {
    String expectedUrl = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores/" + layerName + "/coverages";

    // Mock response
    ResponseEntity<String> successResponse = new ResponseEntity<>("Created", HttpStatus.CREATED);
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
      .thenReturn(successResponse);

    // Execute
    boolean result = geoServerService.registerCoverageLayer(layerName);

    // Verify
    verify(restTemplate, times(1)).exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    assertThat(result).isTrue();
  }

  @Test
  void testRegisterCoverageLayer_Failure() {
    String expectedUrl = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores/" + layerName + "/coverages";

    // Mock response
    ResponseEntity<String> failureResponse = new ResponseEntity<>("Error", HttpStatus.BAD_REQUEST);
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
      .thenReturn(failureResponse);

    // Execute
    boolean result = geoServerService.registerCoverageLayer(layerName);

    // Verify
    verify(restTemplate, times(1)).exchange(eq(expectedUrl), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class));
    assertThat(result).isFalse();
  }

  @Test
  void testUnregisterLayer_Success() {
    String expectedUrl = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores/" + layerName + "?purge=all&recurse=true";

    // Mock response
    ResponseEntity<String> successResponse = new ResponseEntity<>(HttpStatus.NO_CONTENT);
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(String.class)))
      .thenReturn(successResponse);

    // Execute
    boolean result = geoServerService.unregisterLayer(layerName);

    // Verify
    verify(restTemplate, times(1)).exchange(eq(expectedUrl), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(String.class));
    assertThat(result).isTrue();
  }

  @Test
  void testUnregisterLayer_Failure() {
    String expectedUrl = geoserverUrl + "/rest/workspaces/" + workspace + "/coveragestores/" + layerName + "?purge=all&recurse=true";

    // Mock response
    ResponseEntity<String> failureResponse = new ResponseEntity<>("Error", HttpStatus.INTERNAL_SERVER_ERROR);
    when(restTemplate.exchange(eq(expectedUrl), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(String.class)))
      .thenReturn(failureResponse);

    // Execute
    boolean result = geoServerService.unregisterLayer(layerName);

    // Verify
    verify(restTemplate, times(1)).exchange(eq(expectedUrl), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(String.class));
    assertThat(result).isFalse();
  }

  @Test
  void deleteTifFile_shouldDeleteFile_ifExists() throws Exception {
    // Arrange
    setField(geoServerService, "geoserverDownloadDir", tempDir.toString());

    String testLayer = "delete_test";
    Path filePath = tempDir.resolve(testLayer + ".tif");
    Files.write(filePath, "test".getBytes());

    assertThat(Files.exists(filePath)).isTrue();

    // Act
    geoServerService.deleteTifFile(testLayer);

    // Assert
    assertThat(Files.exists(filePath)).isFalse();
  }

  @Test
  void deleteTifFile_shouldNotFail_ifFileDoesNotExist() {
    // Arrange
    setField(geoServerService, "geoserverDownloadDir", tempDir.toString());

    String testLayer = "nonexistent";

    // Act & Assert (no exception should be thrown)
    assertThatCode(() -> geoServerService.deleteTifFile(testLayer)).doesNotThrowAnyException();

    Path expectedPath = tempDir.resolve(testLayer + ".tif");
    assertThat(Files.exists(expectedPath)).isFalse();
  }

  // ✅ Utility method to set private fields via reflection
  private void setField(Object target, String fieldName, Object value) {
    try {
      var field = target.getClass().getDeclaredField(fieldName);
      field.setAccessible(true);
      field.set(target, value);
    } catch (Exception e) {
      throw new RuntimeException("Failed to set field: " + fieldName, e);
    }
  }


}
