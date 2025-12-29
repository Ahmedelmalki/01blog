package com.example.demo.service;

import java.util.*;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.example.demo.repository.*;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.*;
import com.example.demo.model.*;


@Service
@AllArgsConstructor
public class NotificationService {

    private final NotificationsRepo notificationsRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    
    public void notifyFollow(User follower, User followed){
        String message = follower.getUsername() + " stated following you";
                System.out.printf("%s   ||||||||| %s",follower.getUsername(), followed.getUsername());

        createAndSendNotification(follower, followed, "FOLLOW", message, null);
    }

    public void notifyNewPost(User author, Long postId, List<User> followers){
        String message = author.getUsername() + " created a new post";
        for (User f: followers){
            createAndSendNotification(f, author, "NEW_POST", message, postId);
        } 
    }

    public Page<Map<String, Object>> getUserNotifications(String username, int page, int size){
        User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("user not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationsRepo.findByNotifiedUser(user, pageable);
        return notifications.map(notification -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", notification.getId());
            map.put("type", notification.getType());
            map.put("message", notification.getMessage());
            map.put("actorUsername", notification.getActor().getUsername());
            map.put("actorProfileLink", notification.getActor().getProfileLink());
            map.put("postId", notification.getPostId());
            map.put("isRead", notification.isRead());
            map.put("createdAt", notification.getCreatedAt());
            return map;
        });
    }    

    public void markAsRead(Long notificationId, String username){
        Notification notification = notificationsRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getNotifiedUser().getUsername().equals(username)){
            throw new RuntimeException("Unauthorized");
        }
        notification.setRead(true);
        notificationsRepo.save(notification);
    }

    public void markAllAsRead(String username){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new  RuntimeException("user not found"));
        List<Notification> unreadNotifications = notificationsRepo.findByNotifiedUserAndIsRead(user, false);
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationsRepo.saveAll(unreadNotifications);
    }

    public long getUnreadCount(String username){
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("user not found"));
        return notificationsRepo.countByNotifiedUserAndIsRead(user, false);
    }

    public void deleteNotification(Long notificationId, String username){
        Notification notification = notificationsRepo.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("notification not found"));
        if (!notification.getNotifiedUser().getUsername().equals(username)){
            throw new RuntimeException("unauthorized");
        }
        notificationsRepo.delete(notification);
    }

    // =========== HELPER ===========
    private void createAndSendNotification(User recipient, User actor, String type, String message, Long postId){
        Notification notification = new Notification();
        notification.setNotifiedUser(actor);
        notification.setActor(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setPostId(postId);
        notification.setRead(false);
        Notification saved = notificationsRepo.save(notification);
        System.out.printf("%s   ||||||||| %s",actor.getUsername(), recipient.getUsername());
        sendNotificationToUser(actor.getUsername(), saved);
    }

    private void sendNotificationToUser(String username, Notification notification){
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", notification.getId());
        payload.put("type", notification.getType());
        payload.put("message", notification.getMessage());
        payload.put("actorUsername", notification.getActor().getUsername());
        payload.put("actorProfileLink", notification.getActor().getProfileLink());
        payload.put("postId", notification.getPostId());
        payload.put("isRead", notification.isRead());
        payload.put("createdAt", notification.getCreatedAt());
        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", payload);
    }
}