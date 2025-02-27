package wildfire.visualization.backend.dto;

import java.time.OffsetDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StacPropertiesDto {
    private OffsetDateTime datetime;
    private OffsetDateTime startDatetime;
    private OffsetDateTime endDatetime;
    private String title;
    private String description;
    private Map<String, Object> additionalProperties;
}
