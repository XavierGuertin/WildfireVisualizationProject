package com.example.backend.controller;

import com.example.backend.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.nio.file.Files;
import org.springframework.core.io.ClassPathResource;

@RestController
public class DataController {
  @Autowired
  private DataService dataService;

  @GetMapping("/api/data")
  public ResponseEntity<String> getData() throws IOException {
    try {
      ClassPathResource resource = new ClassPathResource("synthetic_wildfire_collection.json");
      String jsonData = Files.readString(resource.getFile().toPath());
      return ResponseEntity.ok(jsonData);
    } catch (IOException e) {
      return ResponseEntity.internalServerError()
        .body("Error reading file: " + e.getMessage());
    }
  }

  @GetMapping("/api/test-stac")
  public ResponseEntity<String> testStacEndpoint() {
    try {
      String result = dataService.insertAndQueryCollection();
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
        .body("Error processing STAC data: " + e.getMessage());
    }
  }
}
