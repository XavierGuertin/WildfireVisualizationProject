package com.example.backend.backendTests;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.example.backend.backend.BackendSampleForTesting;

public class BackendSampleJUnitTest {

    @Test
    void createNewBackendForTesting() {
        var test = new BackendSampleForTesting("TEST", true);

        Assertions.assertEquals("TEST", test.name(), "Name was not equal to TEST");

    }

  @Test
  void testIsCompletedTrue() {
    // Arrange: create an instance with completed as true
    BackendSampleForTesting sample = new BackendSampleForTesting("Sample Task", true);

    // Act & Assert
    Assertions.assertTrue(sample.isCompleted(), "The task should be completed.");
  }

  @Test
  void testIsCompletedFalse() {
    // Arrange: create an instance with completed as false
    BackendSampleForTesting sample = new BackendSampleForTesting("Sample Task", false);

    // Act & Assert
    Assertions.assertFalse(sample.isCompleted(), "The task should not be completed.");
  }

  @Test
  void testIsCompletedNull() {
    // Arrange: create an instance with completed as null
    BackendSampleForTesting sample = new BackendSampleForTesting("Sample Task", null);

    // Act & Assert
    Assertions.assertFalse(sample.isCompleted(), "The task should not be completed when completed is null.");
  }

}
