package wildfire.visualization.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import wildfire.visualization.backend.repository.StacRepository;

import java.io.*;
import java.net.URL;
import java.nio.file.*;

@Service
public class GeoTIFFService {

  @Autowired
  private GeoServerService geoServerService;

  @Value("${geoserver.url}")
  private String geoServerUrl;

  @Value("${geoserver.workspace}")
  private String workspace;

  @Value("${geoserver.downloadDir}")
  private String tiffStoragePath;

  @Autowired
  private StacRepository stacRepository;

  /**
   * Processes a GeoTIFF asset by downloading it, storing it in GeoServer, and saving its layer URL in the database.
   *
   * @param itemId The ID of the STAC item containing the asset.
   * @param collectionId The ID of the STAC collection containing the item.
   * @param assetName The name of the asset to process.
   * @param tiffUrl The URL of the GeoTIFF asset.
   * @return true if the asset was successfully processed, false otherwise.
   */
  public boolean processGeoTIFF(String itemId, String collectionId, String assetName, String tiffUrl) {
    try {
      String localFilePath = tiffStoragePath + "/" + assetName + ".tif";
      String layerUrl = geoServerUrl + "/" + workspace + "/wms?service=WMS&request=GetMap&layers=" + workspace + ":" + assetName;

      // Download TIFF to GeoServer storage
      downloadFile(tiffUrl, localFilePath);

      // Register in GeoServer
      boolean storeCreated = geoServerService.registerCoverageStore(assetName);
      if (!storeCreated) return false;

      boolean layerCreated = geoServerService.registerCoverageLayer(assetName);
      if (!layerCreated) return false;

      stacRepository.saveLayer(itemId, collectionId, assetName, layerUrl);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  /**
   * Downloads a file from the specified source URL and saves it to the destination path.
   *
   * @param sourceUrl The URL of the file to download.
   * @param destinationPath The local file system path where the file should be saved.
   * @throws IOException If an I/O error occurs during file download or saving.
   */
  void downloadFile(String sourceUrl, String destinationPath) throws IOException {
    Path filePath = Paths.get(destinationPath);

    Files.createDirectories(filePath.getParent());

    try (InputStream in = new URL(sourceUrl).openStream()) {
      Files.copy(in, filePath, StandardCopyOption.REPLACE_EXISTING);
    }
  }

}
