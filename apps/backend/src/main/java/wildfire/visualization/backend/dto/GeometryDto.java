package wildfire.visualization.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class responsible for defining the data in a Geometry object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeometryDto {
    private String type;
    private double[][] coordinates;
}
