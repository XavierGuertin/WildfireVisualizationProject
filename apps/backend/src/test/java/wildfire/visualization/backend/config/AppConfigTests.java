package wildfire.visualization.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

class AppConfigTests {

  @Test
  void restTemplateBean_ShouldBeCreated() {
    // Arrange
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

    // Act
    RestTemplate restTemplate = context.getBean(RestTemplate.class);

    // Assert
    assertThat(restTemplate).isNotNull();
    context.close();
  }
}
