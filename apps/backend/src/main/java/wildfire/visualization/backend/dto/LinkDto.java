package wildfire.visualization.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class responsible for defining the data in a Link object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkDto {
    private String href;
    private String rel;
    private String type;
    private String title;
}
