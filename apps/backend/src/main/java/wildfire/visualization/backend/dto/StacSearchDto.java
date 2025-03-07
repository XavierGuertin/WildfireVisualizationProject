package wildfire.visualization.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 * DTO class responsible for defining the data in a StacSearch object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StacSearchDto {
    private double[] bbox;
    private OffsetDateTime datetime;
    private List<String> collections;
    private Map<String, Object> query;
    private String sortBy;
    private int limit;
    private int page;
}
