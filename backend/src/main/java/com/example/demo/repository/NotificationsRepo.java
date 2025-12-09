package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;
import com.example.demo.model.*;
import java.util.List;


public interface NotificationsRepo extends JpaRepository<Notification, Long>{

    Page<Notification> findByNotifiedUser(User user, Pageable pageable);
    List<Notification> findByNotifiedUserAndIsRead(User user, boolean isRead);
    long countByNotifiedUserAndIsRead(User user, boolean isRead);
}