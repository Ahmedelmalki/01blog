package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


// Are reports on profiles/posts saved with reasons and timestamps?
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable= false)
    private String reason;

    // ======= MAIN FIELDS =======
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id", nullable = false)
    @JsonIgnoreProperties({"password", "email", "roles"})
    private User reporter;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_user", nullable = true)
    @JsonIgnoreProperties({"password", "email", "roles"})
    private User reportedUser;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_post", nullable = true)
    @JsonIgnoreProperties({"comments"})
    private Post reportedPost;
    // ======== END MAIN FIELDS ======
    
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        validateReport();
    }

    @PreUpdate
    protected void onUpdate() {
        validateReport();
    }

    private void validateReport() {
        if (reportedUser == null && reportedPost == null) {
            throw new IllegalStateException("Report must have either a reported user or reported post");
        }
        if (reportedUser != null && reportedPost != null) {
            throw new IllegalStateException("Report cannot have both a reported user and reported post");
        }
    }
}
