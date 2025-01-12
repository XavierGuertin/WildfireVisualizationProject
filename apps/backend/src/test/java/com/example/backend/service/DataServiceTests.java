package com.example.backend.serviceTests;

import com.example.backend.controller.DataController;
import com.example.backend.service.DataService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataControllerTests {

  @Mock
  private DataService dataService;

  @InjectMocks
  private DataController dataController;

  @Test
  void getData_Success() throws Exception {
    // Act
    ResponseEntity<String> response = dataController.getData();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
  }

  @Test
  void testStacEndpoint_Success() {
    // Arrange
    when(dataService.insertAndQueryCollection())
      .thenReturn("Success result");

    // Act
    ResponseEntity<String> response = dataController.testStacEndpoint();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Success result");
  }

  @Test
  void testStacEndpoint_Failure() {
    // Arrange
    when(dataService.insertAndQueryCollection())
      .thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<String> response = dataController.testStacEndpoint();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Test error");
  }

  @Test
  void createCollection_Success() {
    // Arrange
    String testJson = "{\"id\":\"test\"}";
    when(dataService.insertAndQueryCollection(anyString()))
      .thenReturn("Success result");

    // Act
    ResponseEntity<String> response = dataController.createCollection(testJson);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Success result");
  }

  @Test
  void createCollection_Failure() {
    // Arrange
    String testJson = "{\"id\":\"test\"}";
    when(dataService.insertAndQueryCollection(anyString()))
      .thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<String> response = dataController.createCollection(testJson);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Test error");
  }
}
