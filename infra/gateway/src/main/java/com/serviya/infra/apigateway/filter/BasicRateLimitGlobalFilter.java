package com.serviya.infra.apigateway.filter;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class BasicRateLimitGlobalFilter implements GlobalFilter, Ordered {

  private static final int MAX_REQUESTS_PER_MINUTE = 100;
  private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String ip =
        exchange.getRequest().getRemoteAddress() != null
            ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
            : "unknown";

    return exchange
        .getPrincipal()
        .map(principal -> principal.getName())
        .defaultIfEmpty("anonymous")
        .flatMap(
            user -> {
              String key = ip + ":" + user;
              TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket());

              if (!bucket.tryConsume()) {
                exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                return exchange.getResponse().setComplete();
              }

              return chain.filter(exchange);
            });
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE + 10;
  }

  private static class TokenBucket {
    private final AtomicInteger tokens = new AtomicInteger(0);
    private volatile long windowStart = Instant.now().getEpochSecond();

    public boolean tryConsume() {
      long now = Instant.now().getEpochSecond();
      if (now - windowStart > 60) {
        synchronized (this) {
          if (now - windowStart > 60) {
            tokens.set(0);
            windowStart = now;
          }
        }
      }
      return tokens.incrementAndGet() <= MAX_REQUESTS_PER_MINUTE;
    }
  }
}
