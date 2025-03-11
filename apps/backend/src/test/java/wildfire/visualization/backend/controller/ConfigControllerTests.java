package wildfire.visualization.backend.controller;

import wildfire.visualization.backend.exception.ConfigException;
import wildfire.visualization.backend.exception.GlobalExceptionHandler;
import wildfire.visualization.backend.service.ConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ConfigControllerTests {

  @Mock
  private ConfigService configService;

  @InjectMocks
  private ConfigController configController;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders
        .standaloneSetup(configController)
        .setControllerAdvice(new GlobalExceptionHandler())
        .build();
  }

  @Test
  void getConfig_ShouldReturnConfig() throws Exception {
    // Arrange
    Map<String, Object> mockConfig = new HashMap<>();
    mockConfig.put("key", "value");
    when(configService.getConfig()).thenReturn(mockConfig);

    // Act & Assert
    mockMvc.perform(get("/api/config"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.key").value("value"));

    verify(configService, times(1)).getConfig();
  }

  @Test
  void getConfig_ShouldHandleException() throws Exception {
    // Arrange
    when(configService.getConfig()).thenThrow(new ConfigException("Failed to retrieve configuration"));

    // Act & Assert
    mockMvc.perform(get("/api/config"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.status").value(500))
        .andExpect(jsonPath("$.error").value("Config Error"))
        .andExpect(jsonPath("$.message").value("Failed to retrieve configuration"));

    verify(configService, times(1)).getConfig();
  }

  @Test
  void saveConfig_ShouldSaveConfig() throws Exception {
    // Arrange
    Map<String, Object> mockConfig = new HashMap<>();
    mockConfig.put("key", "value");
    doNothing().when(configService).saveConfig(any());

    // Act & Assert
    mockMvc.perform(post("/api/config")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"key\":\"value\"}"))
        .andExpect(status().isOk());

    verify(configService, times(1)).saveConfig(any());
  }

  @Test
  void saveConfig_ShouldHandleException() throws Exception {
    // Arrange
    doThrow(new ConfigException("Failed to save configuration"))
        .when(configService).saveConfig(any());

    // Act & Assert
    mockMvc.perform(post("/api/config")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"key\":\"value\"}"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.status").value(500))
        .andExpect(jsonPath("$.error").value("Config Error"))
        .andExpect(jsonPath("$.message").value("Failed to save configuration"));
  }
}
