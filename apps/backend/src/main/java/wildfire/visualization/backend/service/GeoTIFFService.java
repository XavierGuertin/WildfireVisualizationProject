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

  public boolean processGeoTIFF(String itemId, String collectionId, String assetName, String tiffUrl) {
    try {
      String localFilePath = tiffStoragePath + "/" + assetName + ".tif";
      String layerName = collectionId + "_" + itemId + "_" + assetName;
      String layerUrl = geoServerUrl + "/" + workspace + "/wms?service=WMS&request=GetMap&layers=" + workspace + ":" + layerName;

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
      e.printStackTrace();
      return false;
    }
  }

  private void downloadFile(String sourceUrl, String destinationPath) throws IOException {
    Path filePath = Paths.get(destinationPath);

    // ✅ Ensure the parent directory exists
    Files.createDirectories(filePath.getParent());

    try (InputStream in = new URL(sourceUrl).openStream()) {
      Files.copy(in, filePath, StandardCopyOption.REPLACE_EXISTING);
    }
  }

}
