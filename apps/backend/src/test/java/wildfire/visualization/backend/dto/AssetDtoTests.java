package wildfire.visualization.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import org.junit.jupiter.api.Test;

public class AssetDtoTests {

    @Test
    public void testNoArgsConstructor() {
        AssetDto assetDto = new AssetDto();
        assertNotNull(assetDto);
    }

    @Test
    public void testAllArgsConstructor() {
        List<String> roles = List.of("role1", "role2");

        AssetDto assetDto = new AssetDto("https://example.com", "Example Title", "Example Description",
                "application/json", roles);
        assertEquals("https://example.com", assetDto.getHref());
        assertEquals("Example Title", assetDto.getTitle());
        assertEquals("Example Description", assetDto.getDescription());
        assertEquals("application/json", assetDto.getType());
        assertEquals(roles, assetDto.getRoles());
    }

    @Test
    public void testSettersAndGetters() {
        AssetDto assetDto = new AssetDto();
        List<String> roles = List.of("role1", "role2");

        assetDto.setHref("https://example.com");
        assetDto.setTitle("Example Title");
        assetDto.setDescription("Example Description");
        assetDto.setType("application/json");
        assetDto.setRoles(roles);

        assertEquals("https://example.com", assetDto.getHref());
        assertEquals("Example Title", assetDto.getTitle());
        assertEquals("Example Description", assetDto.getDescription());
        assertEquals("application/json", assetDto.getType());
        assertEquals(roles, assetDto.getRoles());
    }

    @Test
    public void testBuilder() {
        List<String> roles = List.of("role1", "role2");

        AssetDto assetDto = AssetDto.builder()
                .href("https://example.com")
                .title("Example Title")
                .description("Example Description")
                .type("application/json")
                .roles(roles)
                .build();

        assertEquals("https://example.com", assetDto.getHref());
        assertEquals("Example Title", assetDto.getTitle());
        assertEquals("Example Description", assetDto.getDescription());
        assertEquals("application/json", assetDto.getType());
        assertEquals(roles, assetDto.getRoles());
    }
}
