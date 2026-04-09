package com.reviewr.exception;

import com.reviewr.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidExceptions(MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        });

        ErrorResponse errorRes = new ErrorResponse();
        errorRes.setStatus(HttpStatus.BAD_REQUEST.value());
        errorRes.setMessage("Validation Failed");
        errorRes.setTimestamp(System.currentTimeMillis());
        errorRes.setErrors(fieldErrors);

        return new ResponseEntity<>(errorRes, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        ErrorResponse errorRes = new ErrorResponse();

        errorRes.setStatus(ex.getStatusCode().value());
        errorRes.setMessage(ex.getReason());
        errorRes.setTimestamp(System.currentTimeMillis());

        return new ResponseEntity<>(errorRes, ex.getStatusCode());
    }
}
