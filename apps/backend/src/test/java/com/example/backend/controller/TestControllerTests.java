package com.example.backend.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TestControllerTests {

  @Mock
  private JdbcTemplate jdbcTemplate;

  @InjectMocks
  private TestController testController;

  @Test
  void testDbConnection_Success() {
    // Arrange
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class)))
      .thenReturn(1);

    // Act
    ResponseEntity<String> response = testController.testDbConnection();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).contains("Database connected");
    assertThat(response.getBody()).contains("1");
  }

  @Test
  void testDbConnection_Failure() {
    // Arrange
    when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class)))
      .thenThrow(new RuntimeException("Connection failed"));

    // Act
    ResponseEntity<String> response = testController.testDbConnection();

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    assertThat(response.getBody()).contains("Database connection failed");
  }
}
