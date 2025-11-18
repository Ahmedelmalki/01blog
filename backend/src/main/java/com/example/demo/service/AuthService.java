package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtil;
import java.util.HashSet;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import lombok.*;

@AllArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public User register(User user) {
        if(userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        user.setFirstname(user.getFirstname().trim());
        user.setLastname(user.getLastname().trim());
        user.setUsername(user.getUsername().trim());
        user.setEmail(user.getEmail().trim());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setState(1);
        if(user.getRoles() == null) {
            user.setRoles(new HashSet<>());
        }
        if(user.getRoles().isEmpty()) {
            user.getRoles().add("USER");
        }

        if (user.getUsername().equals("admin") || user.getEmail().equals("admin@example.com")) {
        user.getRoles().add("ADMIN");
        }

        return userRepository.save(user);
    }
    
    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // System.out.println("---------------------------\n"+jwtUtil.generateToken(user));
        return jwtUtil.generateToken(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
