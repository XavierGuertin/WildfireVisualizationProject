package com.example.backend.controller;

import com.example.backend.service.ConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class ConfigControllerTests {

  @Mock
  private ConfigService configService;

  @InjectMocks
  private ConfigController configController;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void getConfig_ShouldReturnConfig() {
    // Arrange
    Map<String, Object> mockConfig = new HashMap<>();
    mockConfig.put("key", "value");
    when(configService.getConfig()).thenReturn(mockConfig);

    // Act
    ResponseEntity<Map<String, Object>> response = configController.getConfig();

    // Assert
    assertEquals(ResponseEntity.ok(mockConfig), response);
    verify(configService, times(1)).getConfig();
  }

  @Test
  void getConfig_ShouldHandleException() {
    // Arrange
    when(configService.getConfig()).thenThrow(new RuntimeException("Error"));

    // Act
    ResponseEntity<Map<String, Object>> response = configController.getConfig();

    // Assert
    assertEquals(ResponseEntity.internalServerError().body(null), response);
    verify(configService, times(1)).getConfig();
  }

  @Test
  void saveConfig_ShouldSaveConfig() {
    // Arrange
    Map<String, Object> mockConfig = new HashMap<>();
    mockConfig.put("key", "value");

    // Act
    ResponseEntity<Void> response = configController.saveConfig(mockConfig);

    // Assert
    assertEquals(ResponseEntity.ok().build(), response);
    verify(configService, times(1)).saveConfig(mockConfig);
  }

  @Test
  void saveConfig_ShouldHandleException() {
    // Arrange
    Map<String, Object> mockConfig = new HashMap<>();
    doThrow(new RuntimeException("Error")).when(configService).saveConfig(mockConfig);

    // Act
    ResponseEntity<Void> response = configController.saveConfig(mockConfig);

    // Assert
    assertEquals(ResponseEntity.internalServerError().build(), response);
    verify(configService, times(1)).saveConfig(mockConfig);
  }
}
