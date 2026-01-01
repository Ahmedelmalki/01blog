package com.example.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, LocalDateTime> lastPostTime = new ConcurrentHashMap<>();
    private static final long RATE_LIMIT_MINUTES = 1;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("POST".equalsIgnoreCase(request.getMethod()) && 
            request.getRequestURI().matches("/posts/?")) {
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (auth != null && auth.isAuthenticated()) {
                String username = auth.getName();
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime lastPost = lastPostTime.get(username);

                if (lastPost != null && lastPost.plusMinutes(RATE_LIMIT_MINUTES).isAfter(now)) {
                    // Rate limit exceeded
                    long secondsRemaining = java.time.Duration.between(now, lastPost.plusMinutes(RATE_LIMIT_MINUTES)).getSeconds();
                    
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json");
                    response.getWriter().write(
                        "{\"error\":\"Rate limit exceeded\"," +
                        "\"message\":\"You can only create one post per minute. Please try again in " + secondsRemaining + " seconds.\"," +
                        "\"retryAfter\":" + secondsRemaining + "}"
                    );
                    return;
                }

                lastPostTime.put(username, now);
            }
        }

        filterChain.doFilter(request, response);
    }

    public void cleanup() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(1);
        lastPostTime.entrySet().removeIf(entry -> entry.getValue().isBefore(threshold));
    }
}