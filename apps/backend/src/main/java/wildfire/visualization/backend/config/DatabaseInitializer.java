package wildfire.visualization.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DatabaseInitializer {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  //  Document method below for documentation
  //  Initializes the database by creating the necessary tables if they do not already exist.
  @PostConstruct
  public void initializeDatabase() {
    String createCollections = """
          CREATE TABLE IF NOT EXISTS TIFF_Collections (
              id SERIAL PRIMARY KEY,
              collection_id TEXT UNIQUE NOT NULL
          );
      """;

    String createItems = """
          CREATE TABLE IF NOT EXISTS TIFF_Items (
              id SERIAL PRIMARY KEY,
              item_id TEXT UNIQUE NOT NULL,
              collection_id TEXT NOT NULL REFERENCES TIFF_Collections(collection_id)
          );
      """;

    String createAssets = """
          CREATE TABLE IF NOT EXISTS TIFF_Assets (
              id SERIAL PRIMARY KEY,
              item_id TEXT NOT NULL REFERENCES TIFF_Items(item_id) ON DELETE CASCADE,
              asset_name TEXT NOT NULL,
              layer_url TEXT NOT NULL,
              is_registered BOOLEAN DEFAULT FALSE,
              min INT NOT NULL,
              max INT NOT NULL,
              UNIQUE (item_id, asset_name)
          );
      """;

    jdbcTemplate.execute(createCollections);
    jdbcTemplate.execute(createItems);      // Must be before Assets
    jdbcTemplate.execute(createAssets);     // Must be after Items
  }
}
