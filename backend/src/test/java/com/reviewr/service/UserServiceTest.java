package com.reviewr.service;

import com.reviewr.dto.LoginRequest;
import com.reviewr.dto.RegisterRequest;
import com.reviewr.model.User;
import com.reviewr.repository.UserRepository;
import com.reviewr.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @InjectMocks UserService userService;

    @Test
    void unknownEmailAndWrongPasswordGiveSameError() {
        when(userRepository.findByEmailIgnoreCase("nobody@example.com")).thenReturn(Optional.empty());
        ResponseStatusException unknown = assertThrows(ResponseStatusException.class,
                () -> userService.loginUser(login("nobody@example.com", "secret1")));

        User user = new User();
        user.setEmail("alice@example.com");
        user.setPassword("hash");
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);
        ResponseStatusException wrong = assertThrows(ResponseStatusException.class,
                () -> userService.loginUser(login("alice@example.com", "wrong")));

        assertEquals(HttpStatus.UNAUTHORIZED, unknown.getStatusCode());
        assertEquals(unknown.getReason(), wrong.getReason());
    }

    @Test
    void loginIgnoresEmailCaseAndSpaces() {
        User user = new User();
        user.setEmail("alice@example.com");
        user.setPassword("hash");
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret1", "hash")).thenReturn(true);
        when(jwtUtil.generateToken("alice@example.com")).thenReturn("token");

        assertEquals("token", userService.loginUser(login("  Alice@Example.com ", "secret1")));
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("alice@example.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest();
        request.setUsername("alice");
        request.setEmail("Alice@example.com");
        request.setPassword("secret1");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.registerUser(request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(userRepository, never()).save(any());
    }

    private static LoginRequest login(String email, String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }
}
