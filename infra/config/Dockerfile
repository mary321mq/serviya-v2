FROM eclipse-temurin:17-jre-jammy AS jar
WORKDIR /workspace
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} application.jar

FROM eclipse-temurin:17-jre-jammy
LABEL org.opencontainers.image.title="ServiYa service"
LABEL org.opencontainers.image.vendor="ServiYa"
RUN groupadd --system spring && useradd --system --gid spring spring
WORKDIR /app
ENV SERVER_PORT=8888
COPY --from=jar /workspace/application.jar /app/app.jar
USER spring:spring
EXPOSE 8888
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 CMD wget -qO- "http://127.0.0.1:${SERVER_PORT}/actuator/health" >/dev/null 2>&1 || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]