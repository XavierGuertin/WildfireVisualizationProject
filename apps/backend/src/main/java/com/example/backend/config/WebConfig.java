// com/example/backend/config/WebConfig.java
package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void addCorsCrossOrigins(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOrigins(
        "http://localhost:3000",    // Local development
        "http://frontend:3000"      // Docker container
      )
      .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
      .allowedHeaders("*");
  }
}
