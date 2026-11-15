package com.reviewr.exception;

import com.reviewr.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        // Use the first field message as the main message so the UI can show it directly
        String message = fieldErrors.isEmpty() ? "Validation failed" : fieldErrors.values().iterator().next();
        ErrorResponse body = build(HttpStatus.BAD_REQUEST, message);
        body.setErrors(fieldErrors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        return new ResponseEntity<>(build(ex.getStatusCode(), ex.getReason()), ex.getStatusCode());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleBadJson(HttpMessageNotReadableException ex) {
        return new ResponseEntity<>(build(HttpStatus.BAD_REQUEST, "Request body is missing or not valid JSON"),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOther(Exception ex) {
        // Spring's own web exceptions (404 route, 405 method, ...) already know their status
        if (ex instanceof org.springframework.web.ErrorResponse springError) {
            HttpStatusCode status = springError.getStatusCode();
            return new ResponseEntity<>(build(status, springError.getBody().getDetail()), status);
        }
        log.error("Unexpected error", ex);
        return new ResponseEntity<>(build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again."),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ErrorResponse build(HttpStatusCode status, String message) {
        ErrorResponse body = new ErrorResponse();
        body.setStatus(status.value());
        body.setMessage(message);
        body.setTimestamp(System.currentTimeMillis());
        return body;
    }
}
