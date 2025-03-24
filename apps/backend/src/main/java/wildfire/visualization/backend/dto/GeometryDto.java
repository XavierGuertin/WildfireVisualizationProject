package wildfire.visualization.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * DTO class responsible for defining the data in a Geometry object
 */
@Data
@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GeometryDto {
    private String type;
    private double[][] coordinates;
}
