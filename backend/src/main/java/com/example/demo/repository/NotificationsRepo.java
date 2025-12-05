package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Notification;

public interface NotificationsRepo extends JpaRepository<Notification, Long>{

    
}