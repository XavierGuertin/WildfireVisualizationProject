package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Geometry;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostGISData {
    private String id;
    private Geometry geometry;
    private double[] bbox;
    private Map<String, Object> metadata;
    private String spatialIndex;
    private LocalDateTime timestamp;
}