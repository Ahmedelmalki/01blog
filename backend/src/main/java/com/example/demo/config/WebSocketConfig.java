package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config){
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
        System.out.println("fuuuuuuuuuuuk1");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){
         registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  
                .withSockJS();
                
        
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
        System.out.println("fuuuuuuuuuuuk2");
    }
}