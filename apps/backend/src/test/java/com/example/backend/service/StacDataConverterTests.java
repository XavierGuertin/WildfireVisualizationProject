package com.example.backend.service;

import com.example.backend.dto.AssetDto;
import com.example.backend.dto.GeometryDto;
import com.example.backend.dto.StacItemDto;
import com.example.backend.exception.StacConversionException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Polygon;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class StacDataConverterTest {

    private StacDataConverter converter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        converter = new StacDataConverter(objectMapper);
    }

    @Test
    void convert_ValidPolygon_ReturnsPostGISData() {
        // Arrange
        StacItemDto stacItem = createValidStacItem();

        // Act
        var result = converter.convert(stacItem);

        // Assert
        assertNotNull(result);
        assertEquals(stacItem.getId(), result.getId());
        assertTrue(result.getGeometry() instanceof Polygon);
        assertEquals(stacItem.getBbox(), result.getBbox());
        assertEquals("test_collection", result.getMetadata().get("collection"));
        assertEquals("1.0.0", result.getMetadata().get("stac_version"));
    }

    @Test
    void convert_WithDateTime_ReturnsCorrectTimestamp() {
        // Arrange
        StacItemDto stacItem = createValidStacItem();
        Map<String, Object> properties = new HashMap<>();
        properties.put("datetime", "2024-01-01T12:00:00Z");
        stacItem.setProperties(properties);

        // Act
        var result = converter.convert(stacItem);

        // Assert
        assertEquals(
                LocalDateTime.of(2024, 1, 1, 12, 0, 0),
                result.getTimestamp());
    }

    @Test
    void convert_WithoutDateTime_ReturnsCurrentTimestamp() {
        // Arrange
        StacItemDto stacItem = createValidStacItem();
        stacItem.setProperties(new HashMap<>());

        // Act
        var result = converter.convert(stacItem);

        // Assert
        assertNotNull(result.getTimestamp());
        assertTrue(result.getTimestamp().isBefore(LocalDateTime.now().plusSeconds(1)));
        assertTrue(result.getTimestamp().isAfter(LocalDateTime.now().minusSeconds(1)));
    }

    @Test
    void convert_WithAssets_IncludesAssetsInMetadata() {
        // Arrange
        StacItemDto stacItem = createValidStacItem();
        Map<String, AssetDto> assets = new HashMap<>();
        AssetDto thumbnailAsset = new AssetDto();
        thumbnailAsset.setHref("https://example.com/thumb.jpg");
        assets.put("thumbnail", thumbnailAsset);
        stacItem.setAssets(assets);

        // Act
        var result = converter.convert(stacItem);

        // Assert
        assertNotNull(result.getMetadata().get("assets"));
        @SuppressWarnings("unchecked")
        Map<String, Object> resultAssets = (Map<String, Object>) result.getMetadata().get("assets");
        assertTrue(resultAssets.containsKey("thumbnail"));
    }

    @Test
    void convert_InvalidGeometry_ThrowsException() {
        // Arrange
        StacItemDto stacItem = createValidStacItem();
        stacItem.getGeometry().setCoordinates(new double[][] { new double[] { 1.0 } }); // Invalid coordinates

        // Act & Assert
        assertThrows(StacConversionException.class, () -> converter.convert(stacItem));
    }

    private StacItemDto createValidStacItem() {
        StacItemDto stacItem = new StacItemDto();
        stacItem.setId("test_id");
        stacItem.setStacVersion("1.0.0");
        stacItem.setCollection("test_collection");

        GeometryDto geometryDto = new GeometryDto();
        geometryDto.setType("POLYGON");
        geometryDto.setCoordinates(new double[][] {
                { 0.0, 0.0 },
                { 0.0, 1.0 },
                { 1.0, 1.0 },
                { 1.0, 0.0 },
                { 0.0, 0.0 }
        });
        stacItem.setGeometry(geometryDto);

        stacItem.setBbox(new double[] { 0.0, 0.0, 1.0, 1.0 });
        stacItem.setProperties(new HashMap<>());

        return stacItem;
    }
}