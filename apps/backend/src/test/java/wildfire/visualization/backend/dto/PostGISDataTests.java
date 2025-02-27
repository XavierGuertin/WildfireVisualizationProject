package wildfire.visualization.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

class PostGISDataTests {

    @Test
    public void testNoArgsConstructor() {
        PostGISData postGISData = new PostGISData();
        assertNotNull(postGISData);
    }

    @Test
    public void testAllArgsConstructor() {
        GeometryFactory geometryFactory = new GeometryFactory();
        Point geometry = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(1.0, 2.0));
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("key", "value");
        LocalDateTime timestamp = LocalDateTime.now();

        PostGISData postGISData = new PostGISData("id", geometry, bbox, metadata, "spatialIndex", timestamp);
        assertEquals("id", postGISData.getId());
        assertEquals(geometry, postGISData.getGeometry());
        assertEquals(bbox, postGISData.getBbox());
        assertEquals(metadata, postGISData.getMetadata());
        assertEquals("spatialIndex", postGISData.getSpatialIndex());
        assertEquals(timestamp, postGISData.getTimestamp());
    }

    @Test
    public void testSettersAndGetters() {
        PostGISData postGISData = new PostGISData();
        GeometryFactory geometryFactory = new GeometryFactory();
        Point geometry = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(1.0, 2.0));
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("key", "value");
        LocalDateTime timestamp = LocalDateTime.now();

        postGISData.setId("id");
        postGISData.setGeometry(geometry);
        postGISData.setBbox(bbox);
        postGISData.setMetadata(metadata);
        postGISData.setSpatialIndex("spatialIndex");
        postGISData.setTimestamp(timestamp);

        assertEquals("id", postGISData.getId());
        assertEquals(geometry, postGISData.getGeometry());
        assertEquals(bbox, postGISData.getBbox());
        assertEquals(metadata, postGISData.getMetadata());
        assertEquals("spatialIndex", postGISData.getSpatialIndex());
        assertEquals(timestamp, postGISData.getTimestamp());
    }

    @Test
    public void testBuilder() {
        GeometryFactory geometryFactory = new GeometryFactory();
        Point geometry = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(1.0, 2.0));
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("key", "value");
        LocalDateTime timestamp = LocalDateTime.now();

        PostGISData postGISData = PostGISData.builder()
                .id("id")
                .geometry(geometry)
                .bbox(bbox)
                .metadata(metadata)
                .spatialIndex("spatialIndex")
                .timestamp(timestamp)
                .build();

        assertEquals("id", postGISData.getId());
        assertEquals(geometry, postGISData.getGeometry());
        assertEquals(bbox, postGISData.getBbox());
        assertEquals(metadata, postGISData.getMetadata());
        assertEquals("spatialIndex", postGISData.getSpatialIndex());
        assertEquals(timestamp, postGISData.getTimestamp());
    }
}
