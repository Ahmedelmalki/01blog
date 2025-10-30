package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

import java.util.HashSet;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {
        if(userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        if(user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }
        if(user.getRoles().isEmpty()) {
            user.getRoles().add("USER");
        }

        user.setUsername(user.getUsername().trim());
        user.setEmail(user.getEmail().trim());

        return userRepository.save(user);
    }
}
