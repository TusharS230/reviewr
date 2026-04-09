package com.reviewr.controller;

import com.reviewr.dto.LoginRequest;
import com.reviewr.dto.RegisterRequest;
import com.reviewr.model.User;
import com.reviewr.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // The old createUser method has been deleted!

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Added "/register" to create the exact endpoint we need
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User savedUser = userService.registerUser(request);
        return new ResponseEntity<>(
                "User registered successfully with ID: " + savedUser.getId(),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = userService.loginUser(request);
        return ResponseEntity.ok(Collections.singletonMap("token", token));
    }
}