package com.serviya.testing;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;

public class KafkaEventContractValidator {

  private static final List<String> REQUIRED_FIELDS =
      Arrays.asList("eventId", "eventType", "aggregateId", "correlationId", "timestamp", "version");

  public static void validateEventClass(Class<?> eventClass) {
    List<String> fieldNames =
        Arrays.stream(eventClass.getDeclaredFields()).map(Field::getName).toList();

    for (String requiredField : REQUIRED_FIELDS) {
      assertThat(fieldNames)
          .withFailMessage(
              "Event class "
                  + eventClass.getSimpleName()
                  + " is missing mandatory contract field: "
                  + requiredField)
          .contains(requiredField);
    }
  }
}
