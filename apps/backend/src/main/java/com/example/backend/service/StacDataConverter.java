package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.exception.StacConversionException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.WKTReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

@Component
public class StacDataConverter {
    private final WKTReader wktReader;
    private final ObjectMapper objectMapper;

    @Autowired
    public StacDataConverter(ObjectMapper objectMapper) {
        this.wktReader = new WKTReader();
        this.objectMapper = objectMapper;
    }

    public PostGISData convert(StacItemDto stacItem) {
        try {
            // Convert geometry
            Geometry geometry = convertGeometry(stacItem.getGeometry());

            // Extract metadata
            Map<String, Object> metadata = extractMetadata(stacItem);

            return PostGISData.builder()
                    .id(stacItem.getId())
                    .geometry(geometry)
                    .bbox(stacItem.getBbox())
                    .metadata(metadata)
                    .timestamp(extractTimestamp(stacItem))
                    .build();
        } catch (Exception e) {
            throw new StacConversionException("Failed to convert STAC data", e);
        }
    }

    private Geometry convertGeometry(GeometryDto geometryDto) throws Exception {
        // Add an extra set of parentheses for the coordinate sequence
        String wkt = String.format("%s((%s))",
                geometryDto.getType().toUpperCase(),
                formatCoordinates(geometryDto.getCoordinates()));
        return wktReader.read(wkt);
    }

    private String formatCoordinates(double[][] coordinates) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < coordinates.length; i++) {
            if (i > 0) {
                sb.append(", ");
            }
            sb.append(coordinates[i][0]).append(" ").append(coordinates[i][1]);
        }
        return sb.toString();
    }

    private Map<String, Object> extractMetadata(StacItemDto item) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.putAll(item.getProperties());
        if (item.getAssets() != null) {
            metadata.put("assets", item.getAssets());
        }
        metadata.put("stac_version", item.getStacVersion());
        metadata.put("collection", item.getCollection());
        return metadata;
    }

    private LocalDateTime extractTimestamp(StacItemDto item) {
        if (item.getProperties() != null && item.getProperties().containsKey("datetime")) {
            String datetime = (String) item.getProperties().get("datetime");
            return LocalDateTime.parse(datetime.replace("Z", "")).atOffset(ZoneOffset.UTC).toLocalDateTime();
        }
        return LocalDateTime.now();
    }
}