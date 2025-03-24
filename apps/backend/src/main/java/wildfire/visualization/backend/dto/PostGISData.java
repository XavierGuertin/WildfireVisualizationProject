package wildfire.visualization.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Geometry;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO class responsible for defining the data in a PostGISData object
 */
@Data
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostGISData {
    private String id;
    private Geometry geometry;
    private double[] bbox;
    private Map<String, Object> metadata;
    private String spatialIndex;
    private LocalDateTime timestamp;
}
