package wildfire.visualization.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

class LinkDtoTests {

    @Test
    public void testNoArgsConstructor() {
        LinkDto linkDto = new LinkDto();
        assertNotNull(linkDto);
    }

    @Test
    public void testAllArgsConstructor() {
        LinkDto linkDto = new LinkDto("https://example.com", "self", "application/json", "Example Title");
        assertEquals("https://example.com", linkDto.getHref());
        assertEquals("self", linkDto.getRel());
        assertEquals("application/json", linkDto.getType());
        assertEquals("Example Title", linkDto.getTitle());
    }

    @Test
    public void testSettersAndGetters() {
        LinkDto linkDto = new LinkDto();
        linkDto.setHref("https://example.com");
        linkDto.setRel("self");
        linkDto.setType("application/json");
        linkDto.setTitle("Example Title");

        assertEquals("https://example.com", linkDto.getHref());
        assertEquals("self", linkDto.getRel());
        assertEquals("application/json", linkDto.getType());
        assertEquals("Example Title", linkDto.getTitle());
    }

    @Test
    public void testBuilder() {
        LinkDto linkDto = LinkDto.builder()
                .href("https://example.com")
                .rel("self")
                .type("application/json")
                .title("Example Title")
                .build();

        assertEquals("https://example.com", linkDto.getHref());
        assertEquals("self", linkDto.getRel());
        assertEquals("application/json", linkDto.getType());
        assertEquals("Example Title", linkDto.getTitle());
    }
}
