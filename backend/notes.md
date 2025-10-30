what is gpl

**wtf-are-volumes:**
```
TL;DR: In Docker Compose, a volume is basically a place on your host machine (or managed by Docker) where data from a container can be stored persistently, even if the container is deleted or recreated.

Without volumes, any data inside a container is lost when the container stops. With volumes, things like database files, logs, or uploaded files survive container restarts.

So when Compose talks about volumes, it just means “persistent storage for your services.”

If you want, I can give a tiny visual example for your MySQL container so it “keeps” the database even if you docker-compose down
```
**🧩 File-by-File Overview**

```
1. DemoApplication.java
The Spring Boot entry point.
Bootstraps the app
Enables JPA repositories
Can be later annotated with @EnableScheduling if you add notifications

2. model/
Entity layer for database tables.
User.java
Fields: id, username, email, password, bio, profilePicture, role, subscriptions
Relations:
OneToMany → posts
ManyToMany → subscriptions
Role.java
Enum: USER, ADMIN
Post.java
Fields: id, title, content, mediaUrl, createdAt, likes, comments
Relation: ManyToOne → User
Report.java
Fields: id, reportedUser, reason, timestamp, handled
Relation: ManyToOne → User

3. repository/
Spring Data JPA interfaces (extend JpaRepository).

UserRepository.java

PostRepository.java

ReportRepository.java

4. service/

Business logic layer.

AuthService.java

Handles registration, password hashing, and token generation.

UserService.java

Manages profiles, subscriptions, followers, reports.

PostService.java

CRUD for posts, like/comment features.

ReportService.java

Stores and manages user reports for admins.

5. controller/

REST endpoints.

AuthController.java

/auth/register

/auth/login

UserController.java

/users/{id}

/users/subscribe

/users/{id}/followers

/users/report

PostController.java

/posts

/posts/{id}

/posts/{id}/like

/posts/{id}/comment

ReportController.java (Admin only)

/admin/reports

/admin/reports/{id}/handle

6. security/

JWT + Spring Security configuration.

SecurityConfig.java

Defines password encoder

Configures endpoints (permit /auth/**, secure /admin/**)

Registers JWT filter

JwtTokenProvider.java

Generates and validates JWT tokens

JwtAuthenticationFilter.java

Extracts JWT from header and sets authentication in SecurityContext

CustomUserDetailsService.java

Loads user details for authentication

7. payload/
DTOs for cleaner request/response handling.
LoginRequest.java → { username, password }
RegisterRequest.java → { username, email, password }
JwtResponse.java → { token, username, role }
```