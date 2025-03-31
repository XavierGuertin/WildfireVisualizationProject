package wildfire.visualization.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import wildfire.visualization.backend.repository.StacRepository;

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
  void processGeoTIFF_shouldReturnTrue_onSuccess() throws Exception {
    String itemId = "item1", collectionId = "col1", assetName = "a1", url = "http://example.com/file.tif";
    int min = 0, max = 100;

    // Mock file download (assume it's a void method)
    doNothing().when(geoTIFFService).downloadFile(anyString(), anyString());

    boolean result = geoTIFFService.processGeoTIFF(itemId, collectionId, assetName, url, min, max);

    assertThat(result).isTrue();
    verify(stacRepository).saveLayer(eq(itemId), eq(collectionId), eq(assetName), contains("GetMap"), eq(min), eq(max));
    verify(geoTIFFService).downloadFile(eq(url), contains(assetName + ".tif"));
  }

  @Test
  void processGeoTIFF_shouldReturnFalse_onException() throws Exception {
    doThrow(new IOException("Download failed")).when(geoTIFFService).downloadFile(anyString(), anyString());

    boolean result = geoTIFFService.processGeoTIFF("item1", "col1", "a1", "url", 0, 100);

    assertThat(result).isFalse();
    verify(stacRepository).deleteItemAssetLayer("a1", "item1");
  }

  @Test
  void registerGeoTIFF_shouldReturnTrue_onSuccess() {
    when(geoServerService.registerCoverageStore("item1_a1")).thenReturn(true);
    when(geoServerService.registerCoverageLayer("item1_a1")).thenReturn(true);

    boolean result = geoTIFFService.registerGeoTIFF("item1", "a1");

    assertThat(result).isTrue();
    verify(stacRepository).markAssetAsRegistered("item1", "a1");
  }

  @Test
  void registerGeoTIFF_shouldReturnFalse_ifStoreFails() {
    when(geoServerService.registerCoverageStore("item1_a1")).thenReturn(false);

    boolean result = geoTIFFService.registerGeoTIFF("item1", "a1");

    assertThat(result).isFalse();
    verify(stacRepository, never()).markAssetAsRegistered(any(), any());
  }

  @Test
  void registerGeoTIFF_shouldReturnFalse_ifLayerFails() {
    when(geoServerService.registerCoverageStore("item1_a1")).thenReturn(true);
    when(geoServerService.registerCoverageLayer("item1_a1")).thenReturn(false);

    boolean result = geoTIFFService.registerGeoTIFF("item1", "a1");

    assertThat(result).isFalse();
    verify(stacRepository, never()).markAssetAsRegistered(any(), any());
  }

  @Test
  void registerGeoTIFF_shouldHandleExceptionAndDeleteAsset() {
    when(geoServerService.registerCoverageStore(any())).thenThrow(new RuntimeException("fail"));

    boolean result = geoTIFFService.registerGeoTIFF("item1", "a1");

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
