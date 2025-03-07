package wildfire.visualization.backend.dto;

import java.time.OffsetDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * DTO class responsible for defining the data in a StacProperties object
 */
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
