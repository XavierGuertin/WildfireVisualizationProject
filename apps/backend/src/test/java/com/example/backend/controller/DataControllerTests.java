package com.example.backend.controller;

import com.example.backend.service.DataService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataControllerTests {

  @Mock
  private DataService dataService;

  @InjectMocks
  private DataController dataController;

  @Test
  void getData_Success() {
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
  void getMetaData_Success() throws JsonProcessingException {

    //Arrange
    when(dataService.retrieveMetaData(anyString())).thenReturn("[]");

    //Act
    ResponseEntity<String> response = dataController.getMetaData("ID");

    //Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
  }

  @Test
  void getMetaData_Failure() throws JsonProcessingException {

    //Arrange
    when(dataService.retrieveMetaData(anyString())).thenThrow(new RuntimeException("Entry not found"));

    //Act
    ResponseEntity<String> response = dataController.getMetaData("ID");

    //Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isEqualTo("Error processing MetaData: Entry not found");
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

  @Test
  void fetchCollections_Success() {
    // Act
    ResponseEntity<String> response = dataController.fetchCollections();

    // Assert
    verify(dataService, times(1)).fetchAndSaveCollections();
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Collections fetched and saved successfully");
  }

  @Test
  void fetchCollections_Failure() {
    // Arrange
    doThrow(new RuntimeException("Test error")).when(dataService).fetchAndSaveCollections();

    // Act
    ResponseEntity<String> response = dataController.fetchCollections();

    // Assert
    verify(dataService, times(1)).fetchAndSaveCollections();
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Error fetching collections: Test error");
  }

  @Test
  void handleIOException() {
    // Arrange
    doThrow(new RuntimeException("Test IO error")).when(dataService).fetchAndSaveCollections();

    // Act
    ResponseEntity<String> response = dataController.fetchCollections();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Error fetching collections: Test IO error");
  }

  @Test
  void getCollections_Success() {
    // Arrange
    List<Map<String, Object>> mockCollections = List.of(
      Map.of("key", "value1", "id", "id1"),
      Map.of("key", "value2", "id", "id2")
    );
    when(dataService.getCollections()).thenReturn(mockCollections);

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollections();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo(mockCollections);
  }

  @Test
  void getCollections_Failure() {
    // Arrange
    when(dataService.getCollections()).thenThrow(new RuntimeException("Test error"));

    // Act
    ResponseEntity<List<Map<String, Object>>> response = dataController.getCollections();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).isNull();
  }

  @Test
  void resetCollections_Success() {
    // Act
    ResponseEntity<String> response = dataController.resetCollections();

    // Assert
    verify(dataService, times(1)).deleteAllCollections();
    verify(dataService, times(0)).fetchAndSaveCollections();
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Collections deleted successfully");
  }

  @Test
  void resetCollections_Failure() {
    // Arrange
    doThrow(new RuntimeException("Test error")).when(dataService).deleteAllCollections();

    // Act
    ResponseEntity<String> response = dataController.resetCollections();

    // Assert
    verify(dataService, times(1)).deleteAllCollections();
    verify(dataService, times(0)).fetchAndSaveCollections();
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Error resetting collections: Test error");
  }
}
