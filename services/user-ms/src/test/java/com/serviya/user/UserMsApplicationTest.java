package com.serviya.user;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class UserMsApplicationTest {

  @Test
  void contextLoads(
      @org.springframework.beans.factory.annotation.Autowired
          org.springframework.context.ApplicationContext context) {
    org.assertj.core.api.Assertions.assertThat(context).isNotNull();
  }
}
