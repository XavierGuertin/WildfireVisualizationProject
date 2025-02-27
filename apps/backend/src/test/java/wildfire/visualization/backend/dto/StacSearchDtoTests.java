package wildfire.visualization.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class StacSearchDtoTests {

    @Test
    public void testNoArgsConstructor() {
        StacSearchDto stacSearchDto = new StacSearchDto();
        assertNotNull(stacSearchDto);
    }

    @Test
    public void testAllArgsConstructor() {
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        OffsetDateTime now = OffsetDateTime.now();
        List<String> collections = List.of("collection1", "collection2");
        Map<String, Object> query = new HashMap<>();
        query.put("key", "value");

        StacSearchDto stacSearchDto = new StacSearchDto(bbox, now, collections, query, "sortBy", 10, 1);
        assertEquals(bbox, stacSearchDto.getBbox());
        assertEquals(now, stacSearchDto.getDatetime());
        assertEquals(collections, stacSearchDto.getCollections());
        assertEquals(query, stacSearchDto.getQuery());
        assertEquals("sortBy", stacSearchDto.getSortBy());
        assertEquals(10, stacSearchDto.getLimit());
        assertEquals(1, stacSearchDto.getPage());
    }

    @Test
    public void testSettersAndGetters() {
        StacSearchDto stacSearchDto = new StacSearchDto();
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        OffsetDateTime now = OffsetDateTime.now();
        List<String> collections = List.of("collection1", "collection2");
        Map<String, Object> query = new HashMap<>();
        query.put("key", "value");

        stacSearchDto.setBbox(bbox);
        stacSearchDto.setDatetime(now);
        stacSearchDto.setCollections(collections);
        stacSearchDto.setQuery(query);
        stacSearchDto.setSortBy("sortBy");
        stacSearchDto.setLimit(10);
        stacSearchDto.setPage(1);

        assertEquals(bbox, stacSearchDto.getBbox());
        assertEquals(now, stacSearchDto.getDatetime());
        assertEquals(collections, stacSearchDto.getCollections());
        assertEquals(query, stacSearchDto.getQuery());
        assertEquals("sortBy", stacSearchDto.getSortBy());
        assertEquals(10, stacSearchDto.getLimit());
        assertEquals(1, stacSearchDto.getPage());
    }

    @Test
    public void testBuilder() {
        double[] bbox = { 1.0, 2.0, 3.0, 4.0 };
        OffsetDateTime now = OffsetDateTime.now();
        List<String> collections = List.of("collection1", "collection2");
        Map<String, Object> query = new HashMap<>();
        query.put("key", "value");

        StacSearchDto stacSearchDto = StacSearchDto.builder()
                .bbox(bbox)
                .datetime(now)
                .collections(collections)
                .query(query)
                .sortBy("sortBy")
                .limit(10)
                .page(1)
                .build();

        assertEquals(bbox, stacSearchDto.getBbox());
        assertEquals(now, stacSearchDto.getDatetime());
        assertEquals(collections, stacSearchDto.getCollections());
        assertEquals(query, stacSearchDto.getQuery());
        assertEquals("sortBy", stacSearchDto.getSortBy());
        assertEquals(10, stacSearchDto.getLimit());
        assertEquals(1, stacSearchDto.getPage());
    }
}
