package wildfire.visualization.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.slf4j.Logger;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class ConfigServiceTests {

  @Mock
  private ObjectMapper objectMapper;

  @Mock
  private Logger logger;

  @InjectMocks
  private ConfigService configService;

  private static final String CONFIG_FILE_PATH = System.getenv().getOrDefault("CONFIG_FILE_PATH",
      "./../../config/app-config.json");
  private static final Path CONFIG_DIR_PATH = Path.of("apps/config");

  @BeforeEach
  void setUp() throws IOException {
    MockitoAnnotations.openMocks(this);
    Files.createDirectories(CONFIG_DIR_PATH);
  }

  @AfterEach
  void tearDown() throws IOException {
    Files.deleteIfExists(Path.of(CONFIG_FILE_PATH));
    Files.deleteIfExists(CONFIG_DIR_PATH);
  }

  @Test
  void getConfig_ShouldReturnConfig() throws IOException {
    // Arrange
    File configFile = new File(CONFIG_FILE_PATH);
    Files.createFile(configFile.toPath());
    when(objectMapper.readValue(configFile, Map.class)).thenReturn(Map.of("key", "value"));

    // Act
    Map<String, Object> config = configService.getConfig();

    // Assert
    assertEquals(Map.of("key", "value"), config);
  }

  @Test
  void getConfig_ShouldReturnEmptyMap_WhenFileDoesNotExist() {
    // Act
    Map<String, Object> config = configService.getConfig();

    // Assert
    assertEquals(Map.of(), config);
  }

  @Test
  void getConfig_ShouldThrowException_WhenIOExceptionOccurs() throws IOException {
    // Arrange
    Path configFilePath = Path.of(CONFIG_FILE_PATH);
    Files.createDirectories(configFilePath.getParent());
    Files.createFile(configFilePath);
    when(objectMapper.readValue(configFilePath.toFile(), Map.class)).thenThrow(new IOException("Test IO error"));

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class, () -> configService.getConfig());
    assertEquals("Failed to retrieve configuration", exception.getMessage());
  }

  @Test
  void saveConfig_ShouldSaveConfig() throws IOException {
    // Arrange
    Map<String, Object> config = Map.of("key", "value");

    // Act
    configService.saveConfig(config);

    // Assert
    verify(objectMapper, times(1)).writeValue(new File(CONFIG_FILE_PATH), config);
  }

  @Test
  void saveConfig_ShouldThrowException_WhenIOExceptionOccurs() throws IOException {
    // Arrange
    Map<String, Object> config = Map.of("key", "value");
    doThrow(new IOException("Test IO error")).when(objectMapper).writeValue(new File(CONFIG_FILE_PATH), config);

    // Act & Assert
    RuntimeException exception = assertThrows(RuntimeException.class, () -> configService.saveConfig(config));
    assertEquals("Failed to save configuration", exception.getMessage());
  }
}
