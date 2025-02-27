package wildfire.visualization.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class StacPropertiesDtoTests {

    @Test
    public void testNoArgsConstructor() {
        StacPropertiesDto stacPropertiesDto = new StacPropertiesDto();
        assertNotNull(stacPropertiesDto);
    }

    @Test
    public void testAllArgsConstructor() {
        OffsetDateTime now = OffsetDateTime.now();
        Map<String, Object> additionalProps = new HashMap<>();
        additionalProps.put("key", "value");

        StacPropertiesDto stacPropertiesDto = new StacPropertiesDto(now, now, now, "Title", "Description",
                additionalProps);
        assertEquals(now, stacPropertiesDto.getDatetime());
        assertEquals(now, stacPropertiesDto.getStartDatetime());
        assertEquals(now, stacPropertiesDto.getEndDatetime());
        assertEquals("Title", stacPropertiesDto.getTitle());
        assertEquals("Description", stacPropertiesDto.getDescription());
        assertEquals(additionalProps, stacPropertiesDto.getAdditionalProperties());
    }

    @Test
    public void testSettersAndGetters() {
        StacPropertiesDto stacPropertiesDto = new StacPropertiesDto();
        OffsetDateTime now = OffsetDateTime.now();
        Map<String, Object> additionalProps = new HashMap<>();
        additionalProps.put("key", "value");

        stacPropertiesDto.setDatetime(now);
        stacPropertiesDto.setStartDatetime(now);
        stacPropertiesDto.setEndDatetime(now);
        stacPropertiesDto.setTitle("Title");
        stacPropertiesDto.setDescription("Description");
        stacPropertiesDto.setAdditionalProperties(additionalProps);

        assertEquals(now, stacPropertiesDto.getDatetime());
        assertEquals(now, stacPropertiesDto.getStartDatetime());
        assertEquals(now, stacPropertiesDto.getEndDatetime());
        assertEquals("Title", stacPropertiesDto.getTitle());
        assertEquals("Description", stacPropertiesDto.getDescription());
        assertEquals(additionalProps, stacPropertiesDto.getAdditionalProperties());
    }

    @Test
    public void testBuilder() {
        OffsetDateTime now = OffsetDateTime.now();
        Map<String, Object> additionalProps = new HashMap<>();
        additionalProps.put("key", "value");

        StacPropertiesDto stacPropertiesDto = StacPropertiesDto.builder()
                .datetime(now)
                .startDatetime(now)
                .endDatetime(now)
                .title("Title")
                .description("Description")
                .additionalProperties(additionalProps)
                .build();

        assertEquals(now, stacPropertiesDto.getDatetime());
        assertEquals(now, stacPropertiesDto.getStartDatetime());
        assertEquals(now, stacPropertiesDto.getEndDatetime());
        assertEquals("Title", stacPropertiesDto.getTitle());
        assertEquals("Description", stacPropertiesDto.getDescription());
        assertEquals(additionalProps, stacPropertiesDto.getAdditionalProperties());
    }
}
