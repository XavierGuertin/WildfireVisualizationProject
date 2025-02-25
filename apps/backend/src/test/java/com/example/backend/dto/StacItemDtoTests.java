package com.example.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import org.junit.jupiter.api.Test;

class StacItemDtoTests {

    @Test
    public void testNoArgsConstructor() {
        StacItemDto stacItemDto = new StacItemDto();
        assertNotNull(stacItemDto);
    }

    @Test
    public void testAllArgsConstructor() {
        List<String> stacExtensions = List.of("extension1", "extension2");
        GeometryDto geometry = new GeometryDto();
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        Map<String, AssetDto> assets = new HashMap<>();
        List<LinkDto> links = new ArrayList<>();
        Map<String, Object> properties = new HashMap<>();

        StacItemDto stacItemDto = new StacItemDto("id", "Feature", "1.0.0", stacExtensions, geometry, bbox, assets,
                links, properties, "collection");
        assertEquals("id", stacItemDto.getId());
        assertEquals("Feature", stacItemDto.getType());
        assertEquals("1.0.0", stacItemDto.getStacVersion());
        assertEquals(stacExtensions, stacItemDto.getStacExtensions());
        assertEquals(geometry, stacItemDto.getGeometry());
        assertEquals(bbox, stacItemDto.getBbox());
        assertEquals(assets, stacItemDto.getAssets());
        assertEquals(links, stacItemDto.getLinks());
        assertEquals(properties, stacItemDto.getProperties());
        assertEquals("collection", stacItemDto.getCollection());
    }

    @Test
    public void testSettersAndGetters() {
        StacItemDto stacItemDto = new StacItemDto();
        List<String> stacExtensions = List.of("extension1", "extension2");
        GeometryDto geometry = new GeometryDto();
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        Map<String, AssetDto> assets = new HashMap<>();
        List<LinkDto> links = new ArrayList<>();
        Map<String, Object> properties = new HashMap<>();

        stacItemDto.setId("id");
        stacItemDto.setType("Feature");
        stacItemDto.setStacVersion("1.0.0");
        stacItemDto.setStacExtensions(stacExtensions);
        stacItemDto.setGeometry(geometry);
        stacItemDto.setBbox(bbox);
        stacItemDto.setAssets(assets);
        stacItemDto.setLinks(links);
        stacItemDto.setProperties(properties);
        stacItemDto.setCollection("collection");

        assertEquals("id", stacItemDto.getId());
        assertEquals("Feature", stacItemDto.getType());
        assertEquals("1.0.0", stacItemDto.getStacVersion());
        assertEquals(stacExtensions, stacItemDto.getStacExtensions());
        assertEquals(geometry, stacItemDto.getGeometry());
        assertEquals(bbox, stacItemDto.getBbox());
        assertEquals(assets, stacItemDto.getAssets());
        assertEquals(links, stacItemDto.getLinks());
        assertEquals(properties, stacItemDto.getProperties());
        assertEquals("collection", stacItemDto.getCollection());
    }

    @Test
    public void testBuilder() {
        List<String> stacExtensions = List.of("extension1", "extension2");
        GeometryDto geometry = new GeometryDto();
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        Map<String, AssetDto> assets = new HashMap<>();
        List<LinkDto> links = new ArrayList<>();
        Map<String, Object> properties = new HashMap<>();

        StacItemDto stacItemDto = StacItemDto.builder()
                .id("id")
                .type("Feature")
                .stacVersion("1.0.0")
                .stacExtensions(stacExtensions)
                .geometry(geometry)
                .bbox(bbox)
                .assets(assets)
                .links(links)
                .properties(properties)
                .collection("collection")
                .build();

        assertEquals("id", stacItemDto.getId());
        assertEquals("Feature", stacItemDto.getType());
        assertEquals("1.0.0", stacItemDto.getStacVersion());
        assertEquals(stacExtensions, stacItemDto.getStacExtensions());
        assertEquals(geometry, stacItemDto.getGeometry());
        assertEquals(bbox, stacItemDto.getBbox());
        assertEquals(assets, stacItemDto.getAssets());
        assertEquals(links, stacItemDto.getLinks());
        assertEquals(properties, stacItemDto.getProperties());
        assertEquals("collection", stacItemDto.getCollection());
    }
}
