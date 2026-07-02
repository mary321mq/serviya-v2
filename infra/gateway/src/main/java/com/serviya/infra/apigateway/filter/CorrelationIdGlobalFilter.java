package com.serviya.infra.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class CorrelationIdGlobalFilter implements GlobalFilter, Ordered {

  public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String correlationId = exchange.getRequest().getHeaders().getFirst(CORRELATION_ID_HEADER);
    if (correlationId == null || correlationId.isBlank()) {
      correlationId = java.util.UUID.randomUUID().toString();
    }

    ServerWebExchange mutatedExchange =
        exchange
            .mutate()
            .request(
                exchange.getRequest().mutate().header(CORRELATION_ID_HEADER, correlationId).build())
            .build();
    mutatedExchange.getResponse().getHeaders().set(CORRELATION_ID_HEADER, correlationId);

    return chain.filter(mutatedExchange);
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }
}
