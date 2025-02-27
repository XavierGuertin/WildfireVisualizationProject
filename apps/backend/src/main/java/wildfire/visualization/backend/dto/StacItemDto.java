package wildfire.visualization.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StacItemDto {
    private String id;
    private String type;
    private String stacVersion;
    private List<String> stacExtensions;
    private GeometryDto geometry;
    private double[] bbox;
    private Map<String, AssetDto> assets;
    private List<LinkDto> links;
    private Map<String, Object> properties;
    private String collection;
}
