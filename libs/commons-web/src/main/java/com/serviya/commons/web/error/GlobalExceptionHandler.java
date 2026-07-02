package com.serviya.commons.web.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.time.Instant;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ResourceNotFoundException.class)
  public ProblemDetail handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
    return createProblemDetail(ex, HttpStatus.NOT_FOUND, "Not Found", request);
  }

  @ExceptionHandler(ConflictException.class)
  public ProblemDetail handleConflict(ConflictException ex, HttpServletRequest request) {
    return createProblemDetail(ex, HttpStatus.CONFLICT, "Conflict", request);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ProblemDetail handleBadRequest(IllegalArgumentException ex, HttpServletRequest request) {
    return createProblemDetail(ex, HttpStatus.BAD_REQUEST, "Bad Request", request);
  }

  @ExceptionHandler(IllegalStateException.class)
  public ProblemDetail handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
    return createProblemDetail(ex, HttpStatus.CONFLICT, "Conflict", request);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ProblemDetail handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
    return createProblemDetail(ex, HttpStatus.FORBIDDEN, "Forbidden", request);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ProblemDetail handleValidationErrors(
      MethodArgumentNotValidException ex, HttpServletRequest request) {
    String errors =
        ex.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
    ProblemDetail problem =
        createProblemDetail(ex, HttpStatus.BAD_REQUEST, "Validation Error", request);
    problem.setDetail(errors);
    return problem;
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ProblemDetail handleConstraintViolation(
      ConstraintViolationException ex, HttpServletRequest request) {
    String errors =
        ex.getConstraintViolations().stream()
            .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
            .collect(Collectors.joining(", "));
    ProblemDetail problem =
        createProblemDetail(ex, HttpStatus.BAD_REQUEST, "Validation Error", request);
    problem.setDetail(errors);
    return problem;
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail handleGenericException(Exception ex, HttpServletRequest request) {
    log.error(
        "Unhandled exception processing request {}: {}",
        request.getRequestURI(),
        ex.getMessage(),
        ex);
    return createProblemDetail(
        ex, HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", request);
  }

  private ProblemDetail createProblemDetail(
      Exception ex, HttpStatus status, String title, HttpServletRequest request) {
    ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(status, ex.getMessage());
    problemDetail.setTitle(title);
    problemDetail.setType(URI.create("https://serviya.com/errors/" + status.value()));
    problemDetail.setProperty("timestamp", Instant.now());
    problemDetail.setProperty("path", request.getRequestURI());

    String correlationId = request.getHeader("X-Correlation-Id");
    if (correlationId != null) {
      problemDetail.setProperty("correlationId", correlationId);
    }

    if (status.is4xxClientError()) {
      log.warn(
          "Client error on {} ({}): {}", request.getRequestURI(), status.value(), ex.getMessage());
    }

    return problemDetail;
  }
}
