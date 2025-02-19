package com.example.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

class GeometryDtoTests {

    @Test
    public void testNoArgsConstructor() {
        GeometryDto geometryDto = new GeometryDto();
        assertNotNull(geometryDto);
    }

    @Test
    public void testAllArgsConstructor() {
        double[][] coordinates = { { 1.0, 2.0 }, { 3.0, 4.0 } };

        GeometryDto geometryDto = new GeometryDto("Point", coordinates);
        assertEquals("Point", geometryDto.getType());
        assertEquals(coordinates, geometryDto.getCoordinates());
    }

    @Test
    public void testSettersAndGetters() {
        GeometryDto geometryDto = new GeometryDto();
        double[][] coordinates = { { 1.0, 2.0 }, { 3.0, 4.0 } };

        geometryDto.setType("Point");
        geometryDto.setCoordinates(coordinates);

        assertEquals("Point", geometryDto.getType());
        assertEquals(coordinates, geometryDto.getCoordinates());
    }

    @Test
    public void testBuilder() {
        double[][] coordinates = { { 1.0, 2.0 }, { 3.0, 4.0 } };

        GeometryDto geometryDto = GeometryDto.builder()
                .type("Point")
                .coordinates(coordinates)
                .build();

        assertEquals("Point", geometryDto.getType());
        assertEquals(coordinates, geometryDto.getCoordinates());
    }
}
