package com.reviewr.service;

import com.reviewr.model.User;
import com.reviewr.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveUser(User user) {
        if(userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "User with this email already exists"
                    );
        }
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );
    }
}
