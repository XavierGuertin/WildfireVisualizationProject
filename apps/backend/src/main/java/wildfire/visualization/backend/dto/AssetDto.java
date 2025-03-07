package wildfire.visualization.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO class responsible for defining the data in an Asset object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetDto {
    private String href;
    private String title;
    private String description;
    private String type;
    private List<String> roles;
}
