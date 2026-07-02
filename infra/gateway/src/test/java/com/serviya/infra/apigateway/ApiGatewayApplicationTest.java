package com.serviya.infra.apigateway;

import com.serviya.infra.apigateway.support.TestJwtDecoderConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestJwtDecoderConfiguration.class)
@SpringBootTest
class ApiGatewayApplicationTest {

  @Test
  void contextLoads(
      @org.springframework.beans.factory.annotation.Autowired
          org.springframework.context.ApplicationContext context) {
    org.assertj.core.api.Assertions.assertThat(context).isNotNull();
  }
}
