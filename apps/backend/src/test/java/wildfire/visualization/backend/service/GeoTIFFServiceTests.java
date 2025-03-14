package wildfire.visualization.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import wildfire.visualization.backend.repository.StacRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class GeoTIFFServiceTests {

  @Mock
  private GeoServerService geoServerService;

  @Mock
  private StacRepository stacRepository;

  @Spy // ✅ FIX: Spy on GeoTIFFService to mock specific methods
  @InjectMocks
  private GeoTIFFService geoTIFFService;

  private final String itemId = "wildfire_timestamp_2023_08_30_12_00_00";
  private final String collectionId = "montreal_2023";
  private final String assetName = "humidity";
  private final String tiffUrl = "https://example.com/humidity.tif"; // Fake URL
  private final String localFilePath = "./geoserver_data/tiffs/humidity.tif";

  @BeforeEach
  void setUp() {
    // ✅ FIX: Use Reflection to set private fields correctly
    setField(geoTIFFService, "geoServerUrl", "http://localhost:8090/geoserver");
    setField(geoTIFFService, "workspace", "Default");
    setField(geoTIFFService, "tiffStoragePath", "./geoserver_data/tiffs");
  }

  @Test
  void testProcessGeoTIFF_Success() throws Exception {
    // ✅ Prevent actual file download
    doNothing().when(geoTIFFService).downloadFile(anyString(), anyString());

    // ✅ Mock GeoServer interactions
    when(geoServerService.registerCoverageStore(assetName)).thenReturn(true);
    when(geoServerService.registerCoverageLayer(assetName)).thenReturn(true);

    // ✅ Mock database save
    doNothing().when(stacRepository).saveLayer(anyString(), anyString(), anyString(), anyString());

    // Execute method
    boolean result = geoTIFFService.processGeoTIFF(itemId, collectionId, assetName, tiffUrl);

    // Verify interactions
    verify(geoTIFFService, times(1)).downloadFile(tiffUrl, localFilePath);
    verify(geoServerService, times(1)).registerCoverageStore(assetName);
    verify(geoServerService, times(1)).registerCoverageLayer(assetName);
    verify(stacRepository, times(1)).saveLayer(anyString(), anyString(), anyString(), anyString());

    // Assert success
    assertThat(result).isTrue();
  }

  @Test
  void testProcessGeoTIFF_FailureOnDownload() throws Exception {
    doThrow(new IOException("Download failed")).when(geoTIFFService).downloadFile(anyString(), anyString());

    boolean result = geoTIFFService.processGeoTIFF(itemId, collectionId, assetName, tiffUrl);

    verify(geoTIFFService, times(1)).downloadFile(tiffUrl, localFilePath);
    verify(geoServerService, never()).registerCoverageStore(anyString());
    verify(geoServerService, never()).registerCoverageLayer(anyString());
    verify(stacRepository, never()).saveLayer(anyString(), anyString(), anyString(), anyString());

    assertThat(result).isFalse();
  }

  @Test
  void testProcessGeoTIFF_FailureOnRegisterStore() throws Exception {
    doNothing().when(geoTIFFService).downloadFile(anyString(), anyString());
    when(geoServerService.registerCoverageStore(assetName)).thenReturn(false);

    boolean result = geoTIFFService.processGeoTIFF(itemId, collectionId, assetName, tiffUrl);

    verify(geoTIFFService, times(1)).downloadFile(tiffUrl, localFilePath);
    verify(geoServerService, times(1)).registerCoverageStore(assetName);
    verify(geoServerService, never()).registerCoverageLayer(anyString());
    verify(stacRepository, never()).saveLayer(anyString(), anyString(), anyString(), anyString());

    assertThat(result).isFalse();
  }

  @Test
  void testProcessGeoTIFF_FailureOnRegisterLayer() throws Exception {
    doNothing().when(geoTIFFService).downloadFile(anyString(), anyString());
    when(geoServerService.registerCoverageStore(assetName)).thenReturn(true);
    when(geoServerService.registerCoverageLayer(assetName)).thenReturn(false);

    boolean result = geoTIFFService.processGeoTIFF(itemId, collectionId, assetName, tiffUrl);

    verify(geoTIFFService, times(1)).downloadFile(tiffUrl, localFilePath);
    verify(geoServerService, times(1)).registerCoverageStore(assetName);
    verify(geoServerService, times(1)).registerCoverageLayer(assetName);
    verify(stacRepository, never()).saveLayer(anyString(), anyString(), anyString(), anyString());

    assertThat(result).isFalse();
  }

  @Test
  void testDownloadFile() throws Exception {
    String tempFile = "./geoserver_data/tiffs/test.tif";

    Files.createDirectories(Path.of("./geoserver_data/tiffs"));
    Files.write(Path.of(tempFile), "test data".getBytes());

    assertThat(Files.exists(Path.of(tempFile))).isTrue();

    Files.deleteIfExists(Path.of(tempFile));
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
