package wildfire.visualization.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

@Component
public class DatabaseInitializer {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @PostConstruct
  public void initializeDatabase() {
    String sql = """
            CREATE TABLE IF NOT EXISTS ItemAssets (
                id SERIAL PRIMARY KEY,
                item_id TEXT NOT NULL,
                collection_id TEXT NOT NULL,
                asset_name TEXT NOT NULL,
                layer_url TEXT NOT NULL,
                UNIQUE (item_id, collection_id, asset_name)
            );
        """;
    jdbcTemplate.execute(sql);
  }
}
