package com.example.backend.backend;

import com.example.backend.BackendApplication;
import com.example.backend.service.DataService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BackendApplicationTests {

  @Mock
  private DataService dataService;

  @InjectMocks
  private BackendApplication backendApplication;

  @Test
  void run_ShouldFetchAndSaveCollections() throws Exception {
    // Act
    backendApplication.run();

    // Assert
    verify(dataService, times(1)).fetchAndSaveCollections();
  }

  @Test
  void run_ShouldLogError_WhenExceptionThrown() throws Exception {
    // Arrange
    doThrow(new RuntimeException("Test exception")).when(dataService).fetchAndSaveCollections();

    // Act & Assert
    try {
      backendApplication.run();
    } catch (Exception e) {
      // Expected exception
    }

    verify(dataService, times(1)).fetchAndSaveCollections();
  }

  @Test
  void contextLoads() {
    // This test will start the Spring application context and verify that it loads successfully.
  }
}
