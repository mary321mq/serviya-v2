package com.serviya.infra.configserver;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ConfigServerApplicationTest {

  @Test
  void contextLoads(
      @org.springframework.beans.factory.annotation.Autowired
          org.springframework.context.ApplicationContext context) {
    org.assertj.core.api.Assertions.assertThat(context).isNotNull();
  }
}
