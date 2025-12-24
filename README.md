# 01blog

## Summary

**01Blog** is a modern social blogging platform built with Spring Boot and Angular, designed for students to share their learning journey, discoveries, and progress. The platform enables users to create posts with media, interact through likes and comments, follow other users, and receive notifications. Administrators can moderate content and manage users through a dedicated dashboard.

This project demonstrates a complete full-stack architecture using industry-standard technologies, security practices, and modern development patterns including JWT authentication, role-based access control, RESTful APIs, reactive programming, and containerized deployment.

---

![Evolution of blogging stacks](./visual_evolution.png)

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure & Makefile](#project-structure--makefile)
3. [Backend Architecture](#backend-architecture)
4. [Database Layer](#database-layer)
5. [Docker & Containerization](#docker--containerization)
6. [Frontend Architecture](#frontend-architecture)

---

## Technology Stack

### Backend
- **Java 17** - Modern LTS Java version
- **Spring Boot 3.x** - Production-ready framework
- **Spring Security** - Authentication/authorization
- **Spring Data JPA** - Database access layer
- **Hibernate** - ORM implementation
- **MySQL 8** - Relational database
- **JWT** - Stateless authentication
- **Maven** - Dependency management
- **Lombok** - Boilerplate reduction

### Frontend
- **Angular 17+** - TypeScript web framework
- **Angular Material** - UI components
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript
- **Font Awesome** - Icons
- **ng-recaptcha** - CAPTCHA integration

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Makefile** - Build automation

---

## Project Structure & Makefile

### Backend Structure
```
backend/
├── src/main/java/com/example/demo/
│   ├── config/          # Security, CORS, JWT, WebSocket
│   ├── controller/      # REST endpoints
│   ├── DTO/            # Data Transfer Objects
│   ├── exception/      # Global error handling
│   ├── model/          # JPA entities
│   ├── repository/     # Database access
│   ├── service/        # Business logic
│   └── util/           # Utilities
├── src/main/resources/
│   └── application.properties
├── docker-compose.yml
├── Dockerfile
└── pom.xml
```

### Frontend Structure
```
frontend/src/app/
├── admin/             # Admin dashboard
├── auth/              # Login/Register
├── creat-post/        # Post creation
├── feed/              # Main feed
├── notifications/     # Notifications
├── profile/           # User profiles
├── services/          # Angular services
├── shared/            # Reusable components
└── models/            # TypeScript interfaces
```

### Makefile Commands

```bash
make run      # Build and start
make up       # Start services
make down     # Stop services
make logs     # View logs
make restart  # Restart all
make clean    # Clean Docker
make enter    # MySQL shell
```

---

## Backend Architecture

### 3.1 The Old Way: Raw Servlets

**Before Spring Boot:**
```java
public class LoginServlet extends HttpServlet {
    public void doPost(HttpServletRequest request, 
                      HttpServletResponse response) {
        // Manual parameter extraction
        String username = request.getParameter("username");
        
        // Manual database connection
        Connection conn = DriverManager.getConnection(...);
        
        // Manual SQL
        PreparedStatement stmt = conn.prepareStatement(
            "SELECT * FROM users WHERE username = ?");
        
        // Manual response
        PrintWriter out = response.getWriter();
        out.println("<html>...</html>");
        
        // Manual cleanup
        stmt.close();
        conn.close();
    }
}
```

**Problems:**
- Manual dependency management
- Repetitive boilerplate
- XML configuration hell
- No built-in security
- Error-prone resource management

### 3.2 Why Spring Boot is Better

```java
@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String token = authService.login(
            request.getUsername(), 
            request.getPassword()
        );
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}
```

**Improvements:**
- Auto-configuration
- Dependency injection
- Annotation-based
- Built-in JSON handling
- Global exception handling
- Embedded server

### 3.3 Inversion of Control (IoC)

**Without IoC:**
```java
public class UserController {
    private UserService userService;
    
    public UserController() {
        this.userService = new UserService(); // Tightly coupled
    }
}
```

**With IoC:**
```java
@RestController
@AllArgsConstructor
public class AuthController {
    private final AuthService authService;      // Injected
    private final RecaptchaService recaptcha;   // Injected
}
```

**How it works:**
1. Spring scans for `@Component`, `@Service`, `@Repository`, `@Controller`
2. Creates instances (beans)
3. Injects dependencies
4. Manages lifecycle

**📚 Official:** [Spring IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)

### 3.4 Aspect-Oriented Programming (AOP)

**Concept:** Add cross-cutting concerns without modifying business logic.

**Without AOP:**
```java
public class PostService {
    public Post createPost(PostDTO dto) {
        log.info("Creating post");     // Manual
        Post post = new Post();
        // business logic
        log.info("Post created");      // Manual
        return post;
    }
}
```

**With AOP:**
```java
@Aspect
@Component
public class LoggingAspect {
    @Around("execution(* com.example.demo.service.*.*(..))")
    public Object logMethod(ProceedingJoinPoint jp) {
        log.info("Calling: " + jp.getSignature());
        Object result = jp.proceed();
        log.info("Completed");
        return result;
    }
}
```

**📚 Official:** [Spring AOP](https://docs.spring.io/spring-framework/reference/core/aop.html)

### 3.5 JWT Authentication

**Structure:**
```
Header.Payload.Signature
eyJ...  .eyJ...  .SflK...
```

**Implementation:**

1. **Login:**
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) {
    String token = authService.login(req.getUsername(), req.getPassword());
    return ResponseEntity.ok(new AuthResponse(token));
}
```

2. **Generate Token:**
```java
public String generateToken(String username, List<String> roles) {
    return Jwts.builder()
        .setSubject(username)
        .claim("roles", roles)
        .setExpiration(new Date(System.currentTimeMillis() + 86400000))
        .signWith(SignatureAlgorithm.HS256, secret)
        .compact();
}
```

3. **Validate:**
```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest request, ...) {
        String token = extractToken(request);
        if (token != null && jwtUtil.validateToken(token)) {
            Authentication auth = getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }
}
```

**Why JWT?**
- Stateless (no server-side sessions)
- Scalable (no session sync)
- Mobile-friendly
- Cross-domain compatible

**📚 Official:** [JWT Introduction](https://auth0.com/learn/json-web-tokens)

### 3.6 Maven Build System

**Without Maven:**
```bash
# Download 50+ JARs manually
curl -O spring-boot.jar
curl -O mysql-connector.jar
# ... manually download everything

# Compile manually
javac -cp "spring-boot.jar:mysql.jar:..." src/**/*.java

# Package manually
jar cvf app.jar -C bin/ .
```

**With Maven:**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

```bash
mvn clean package  # Does everything automatically
```

**Multi-stage Docker:**
```dockerfile
FROM maven:3.9.4-eclipse-temurin-17 AS build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
COPY --from=build /app/target/*.jar /app/app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

---

## Database Layer

### 4.1 JPA & JDBC

**Raw JDBC:**
```java
public List<Post> getAllPosts() {
    List<Post> posts = new ArrayList<>();
    Connection conn = dataSource.getConnection();
    PreparedStatement stmt = conn.prepareStatement("SELECT * FROM posts");
    ResultSet rs = stmt.executeQuery();
    
    while (rs.next()) {
        Post post = new Post();
        post.setId(rs.getLong("id"));
        post.setContent(rs.getString("content"));
        // ... manually map fields
        posts.add(post);
    }
    return posts;
}
```

**With JPA:**
```java
@Entity
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String content;
    
    @ManyToOne
    private User author;
    
    @OneToMany(mappedBy = "post")
    private List<Comment> comments;
}

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAll();  // Auto-implemented
}
```

### 4.2 Hibernate ORM

**Configuration:**
```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

**Features:**

1. **Auto Schema:**
```java
@Entity
public class Post {
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(nullable = false, length = 5000)
    private String content;
}
```
Generates:
```sql
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(5000) NOT NULL
);
```

2. **Lazy Loading:**
```java
@OneToMany(fetch = FetchType.LAZY)
private List<Comment> comments;  // Loaded on access
```

3. **Query Methods:**
```java
List<Post> findByAuthor(User author);
List<Post> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date);
```

**📚 Official:** [Hibernate ORM](https://hibernate.org/orm/)

### 4.3 MySQL Client/Server Model

**Architecture:**
```
Client (Spring Boot) ←→ Server (mysqld)
     JDBC Driver          Port 3306
```

**Docker Setup:**
```yaml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: 01blogdb
      MYSQL_USER: 01blog
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  backend:
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/01blogdb
    depends_on:
      db:
        condition: service_healthy
```

**Connection String:**
```
jdbc:mysql://db:3306/01blogdb?useSSL=false
│    │     │  │    │
│    │     │  │    └─ Database
│    │     │  └─ Port
│    │     └─ Host (container name)
│    └─ DB type
└─ Protocol
```

---

## Docker & Containerization

### 5.1 Docker Client/Server Model

**Architecture:**
```
Docker CLI → Docker Daemon → Containers
            (REST API)
```

**Dockerfile (Multi-stage):**
```dockerfile
# Build stage
FROM maven:3.9.4 AS build
COPY pom.xml .
COPY src ./src
RUN mvn package

# Runtime stage
FROM eclipse-temurin:17-jre
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
```

**Benefits:**
- Smaller images
- Faster builds
- Secure (no build tools in production)

**📚 Official:** [Docker Overview](https://docs.docker.com/get-started/overview/)

### 5.2 Docker Compose

**[PLACEHOLDER: Docker Compose architecture diagram]**

**Full Configuration:**
```yaml
services:
  db:
    image: mysql:8
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
      interval: 5s
    volumes:
      - db_data:/var/lib/mysql

  backend:
    build: .
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"
    volumes:
      - ./uploads:/app/uploads

volumes:
  db_data:
```

**Commands:**
```bash
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose logs -f    # Logs
docker-compose build      # Rebuild
```

**📚 Official:** [Docker Compose](https://docs.docker.com/compose/)

---

## Frontend Architecture

### 6.1 Why Angular?

**Advantages:**
- Full framework (not just a library)
- TypeScript first
- Built-in: routing, HTTP, forms, DI
- Enterprise-ready
- RxJS integration

**Comparison:**
| Feature | Angular | React | Vue |
|---------|---------|-------|-----|
| Learning Curve | Steep | Medium | Easy |
| Type Safety | Built-in | Optional | Optional |
| Structure | Opinionated | Flexible | Flexible |

### 6.2 Features Used

#### 6.2.1 Dependency Injection

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}
  
  login(username: string, password: string) {
    return this.http.post('/api/auth/login', {username, password});
  }
}

@Component({...})
export class LoginComponent {
  constructor(private authService: AuthService) {}  // Injected
}
```

**📚 [Angular DI](https://angular.dev/guide/di)**

#### 6.2.2 Routing

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'feed', component: FeedComponent },
  { path: 'profile/:username', component: ProfileComponent },
  { path: '**', redirectTo: '/login' }
];
```

**📚 [Angular Router](https://angular.dev/guide/routing)**

#### 6.2.3 HTTP Client

```typescript
@Injectable()
export class PostService {
  getPosts(page: number): Observable<PostsResponse> {
    const params = new HttpParams().set('page', page);
    return this.http.get<PostsResponse>('/api/posts', { params });
  }
  
  createPost(post: PostDTO): Observable<Post> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Post>('/api/posts', post, { headers });
  }
}
```

**📚 [HTTP Client](https://angular.dev/guide/http)**

#### 6.2.4 RxJS & Observables

```typescript
// Basic
this.http.get<Post[]>('/api/posts').subscribe({
  next: posts => console.log(posts),
  error: err => console.error(err)
});

// Advanced
getPosts() {
  return this.http.get<PostsResponse>('/api/posts')
    .pipe(
      map(res => res.posts),
      tap(posts => console.log('Loaded:', posts)),
      catchError(err => of([]))
    );
}

// Combine requests
forkJoin({
  user: this.http.get<User>('/api/user'),
  posts: this.http.get<Post[]>('/api/posts')
}).subscribe(({ user, posts }) => {
  this.user = user;
  this.posts = posts;
});

// Debounce search
searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(q => this.http.get(`/api/search?q=${q}`))
  )
  .subscribe(results => this.results = results);
```

**📚 [RxJS](https://rxjs.dev/)**

#### 6.2.5 Standalone Components

```typescript
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent],
  templateUrl: './feed.component.html'
})
export class FeedComponent {}
```

#### 6.2.6 Directives

```html
<!-- Structural -->
<div *ngIf="isLoading">Loading...</div>
<div *ngFor="let post of posts">{{ post.title }}</div>

<!-- Attribute -->
<button [ngClass]="{'active': isActive}">Click</button>
<div [ngStyle]="{'color': isDark ? 'white' : 'black'}">Text</div>
```

#### 6.2.7 Services & State

```typescript
@Injectable({ providedIn: 'root' })
export class DarkModeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();
  
  toggleDarkMode() {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    localStorage.setItem('darkMode', String(newValue));
  }
}
```

#### 6.2.8 Component Communication

```typescript
// Parent → Child
@Component({
  template: `<app-post [post]="selectedPost"></app-post>`
})

// Child
@Input() post!: Post;

// Child → Parent
@Output() likeClicked = new EventEmitter<number>();
onLike() { this.likeClicked.emit(this.post.id); }
```

#### 6.2.9 Lifecycle Hooks

```typescript
export class PostComponent implements OnInit, OnDestroy {
  ngOnInit() {
    this.loadPost();
  }
  
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
```

**📚 [Lifecycle](https://angular.dev/guide/components/lifecycle)**

#### 6.2.10 Angular Material

```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
```

```html
<button mat-raised-button color="primary">Submit</button>
<mat-card>Content</mat-card>
```

**📚 [Angular Material](https://material.angular.io/)**

---

## Summary

**01Blog** demonstrates a complete modern full-stack application:

**Backend:** Spring Boot 3, Spring Security, JPA/Hibernate, JWT, MySQL
**Frontend:** Angular 17+, TypeScript, RxJS, Angular Material  
**DevOps:** Docker, Docker Compose, Multi-stage builds
**Patterns:** RESTful APIs, Dependency Injection, Reactive Programming

This technology stack provides a scalable, maintainable, and secure platform with authentication, authorization, real-time features, media uploads, and admin tools.