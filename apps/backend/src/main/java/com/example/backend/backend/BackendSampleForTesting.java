package com.example.backend.backend;

public record BackendSampleForTesting(String name, Boolean completed) {

  // Method to check if the task is completed
  public boolean isCompleted() {
    return Boolean.TRUE.equals(completed);
  }

}
