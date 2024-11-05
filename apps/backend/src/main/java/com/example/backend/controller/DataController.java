package com.example.backend.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class DataController {

  @CrossOrigin(origins = "http://localhost:3000")
  @GetMapping("/api/data")
  public ResponseEntity<String> getData() throws IOException {
    Path jsonPath = new ClassPathResource("synthetic_wildfire_collection.json").getFile().toPath();
    String jsonData = Files.readString(jsonPath);
    return ResponseEntity.ok(jsonData);
  }
}
