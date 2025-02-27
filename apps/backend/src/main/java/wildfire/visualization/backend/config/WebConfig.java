package wildfire.visualization.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {  // Fixed method name here
    registry.addMapping("/api/**")
      .allowedOrigins(
        "http://localhost:3000",    // Local development
        "http://frontend:3000"      // Docker container
      )
      .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
      .allowedHeaders("*");
  }
}
