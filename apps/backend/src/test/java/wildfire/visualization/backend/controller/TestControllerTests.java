package wildfire.visualization.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import wildfire.visualization.backend.exception.GlobalExceptionHandler;
import wildfire.visualization.backend.exception.TestException;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TestControllerTests {

  @Mock
  private JdbcTemplate jdbcTemplate;

  @InjectMocks
  private TestController testController;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(testController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void testDbConnection_Success() throws Exception {
    // Arrange
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class)))
        .thenReturn(1);

    // Act & Assert
    mockMvc.perform(get("/api/test/db"))
        .andExpect(status().isOk())
        .andExpect(content().string("Database connected! Test query result: 1"));

    verify(jdbcTemplate, times(1)).queryForObject(anyString(), eq(Integer.class));
  }

  @Test
  void testDbConnection_Failure() throws Exception {
    // Arrange
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class)))
        .thenThrow(new TestException("Database connection failed"));

    // Act & Assert
    mockMvc.perform(get("/api/test/db"))
        .andExpect(status().isServiceUnavailable())
        .andExpect(jsonPath("$.status").value(503))
        .andExpect(jsonPath("$.error").value("Test Error"))
        .andExpect(jsonPath("$.message").value("Database connection failed"));

    verify(jdbcTemplate, times(1)).queryForObject(anyString(), eq(Integer.class));
  }
}