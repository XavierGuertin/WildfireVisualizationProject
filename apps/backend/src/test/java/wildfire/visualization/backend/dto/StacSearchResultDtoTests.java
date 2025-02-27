package wildfire.visualization.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.ArrayList;
import org.junit.jupiter.api.Test;

class StacSearchResultDtoTests {

    @Test
    public void testNoArgsConstructor() {
        StacSearchResultDto stacSearchResultDto = new StacSearchResultDto();
        assertNotNull(stacSearchResultDto);
    }

    @Test
    public void testAllArgsConstructor() {
        List<String> stacExtensions = List.of("extension1", "extension2");
        List<LinkDto> links = new ArrayList<>();
        List<StacItemDto> features = new ArrayList<>();

        StacSearchResultDto stacSearchResultDto = new StacSearchResultDto("FeatureCollection", stacExtensions,
                "Context", 100, 10, links, features);
        assertEquals("FeatureCollection", stacSearchResultDto.getType());
        assertEquals(stacExtensions, stacSearchResultDto.getStacExtensions());
        assertEquals("Context", stacSearchResultDto.getContext());
        assertEquals(100, stacSearchResultDto.getMatched());
        assertEquals(10, stacSearchResultDto.getReturned());
        assertEquals(links, stacSearchResultDto.getLinks());
        assertEquals(features, stacSearchResultDto.getFeatures());
    }

    @Test
    public void testSettersAndGetters() {
        StacSearchResultDto stacSearchResultDto = new StacSearchResultDto();
        List<String> stacExtensions = List.of("extension1", "extension2");
        List<LinkDto> links = new ArrayList<>();
        List<StacItemDto> features = new ArrayList<>();

        stacSearchResultDto.setType("FeatureCollection");
        stacSearchResultDto.setStacExtensions(stacExtensions);
        stacSearchResultDto.setContext("Context");
        stacSearchResultDto.setMatched(100);
        stacSearchResultDto.setReturned(10);
        stacSearchResultDto.setLinks(links);
        stacSearchResultDto.setFeatures(features);

        assertEquals("FeatureCollection", stacSearchResultDto.getType());
        assertEquals(stacExtensions, stacSearchResultDto.getStacExtensions());
        assertEquals("Context", stacSearchResultDto.getContext());
        assertEquals(100, stacSearchResultDto.getMatched());
        assertEquals(10, stacSearchResultDto.getReturned());
        assertEquals(links, stacSearchResultDto.getLinks());
        assertEquals(features, stacSearchResultDto.getFeatures());
    }

    @Test
    public void testBuilder() {
        List<String> stacExtensions = List.of("extension1", "extension2");
        List<LinkDto> links = new ArrayList<>();
        List<StacItemDto> features = new ArrayList<>();

        StacSearchResultDto stacSearchResultDto = StacSearchResultDto.builder()
                .type("FeatureCollection")
                .stacExtensions(stacExtensions)
                .context("Context")
                .matched(100)
                .returned(10)
                .links(links)
                .features(features)
                .build();

        assertEquals("FeatureCollection", stacSearchResultDto.getType());
        assertEquals(stacExtensions, stacSearchResultDto.getStacExtensions());
        assertEquals("Context", stacSearchResultDto.getContext());
        assertEquals(100, stacSearchResultDto.getMatched());
        assertEquals(10, stacSearchResultDto.getReturned());
        assertEquals(links, stacSearchResultDto.getLinks());
        assertEquals(features, stacSearchResultDto.getFeatures());
    }
}
