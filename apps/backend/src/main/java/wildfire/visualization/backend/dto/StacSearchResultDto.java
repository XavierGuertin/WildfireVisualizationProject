package wildfire.visualization.backend.dto;

import java.util.List;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StacSearchResultDto {
    private String type;
    private List<String> stacExtensions;
    private String context;
    private int matched;
    private int returned;
    private List<LinkDto> links;
    private List<StacItemDto> features;
}
