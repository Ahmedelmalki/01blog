what is gpl

**wtf-are-volumes:**
```
TL;DR: In Docker Compose, a volume is basically a place on your host machine (or managed by Docker) where data from a container can be stored persistently, even if the container is deleted or recreated.
Without volumes, any data inside a container is lost when the container stops. With volumes, things like database files, logs, or uploaded files survive container restarts.
So when Compose talks about volumes, it just means “persistent storage for your services.”
If you want, I can give a tiny visual example for your MySQL container so it “keeps” the database even if you docker-compose down
```
**🧩 wtf is ssl**

```
SSL, or Secure Sockets Layer, is a security protocol that encrypts data transmitted between a user's browser and a web server, ensuring privacy, authentication, and data integrity during internet communications.
 It functions by establishing a secure connection through a process known as the SSL handshake, where the server presents its public key via an SSL certificate to authenticate its identity, and a shared session key is created for encrypted communication.
 Although SSL has been deprecated since 1999 and replaced by its more secure successor, TLS (Transport Layer Security), the term "SSL" is still commonly used to refer to modern TLS-based encryption.
 An SSL certificate is a digital file that binds a cryptographic key to an organization’s details, enabling the use of HTTPS and providing visual trust indicators like the padlock icon in the browser address bar
```

**wtf is ApplicationContext**
```
ApplicationContext is an interface provided by the Spring Framework that:

Creates and manages beans (your app’s components).

Handles dependency injection.

Manages the application lifecycle (startup, shutdown, etc.).

Provides configuration, event handling, and internationalization.
```
```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(DemoApplication.class, args);

        MyService service = context.getBean(MyService.class);
        service.sayHello();
    }
}
```

**Why should you use JWT?**
```
Let’s talk about the benefits of JSON Web Tokens (JWT) comparing it to Simple Web Tokens (SWT) and Security Assertion Markup Language Tokens (SAML).
As JSON is less verbose than XML, when it is encoded its size is also smaller; making JWT more compact than SAML. This makes JWT a good choice to be passed in HTML and HTTP environments.
Security-wise, SWT can only be symmetric signed by a shared secret using the HMAC algorithm. While JWT and SAML tokens can also use a public/private key pair in the form of a X.509 certificate to sign them. However, signing XML with XML Digital Signature without introducing obscure security holes is very difficult compared to the simplicity of signing JSON.
JSON parsers are common in most programming languages, because they map directly to objects, conversely XML doesn’t have a natural document-to-object mapping. This makes it easier to work with JWT than SAML assertions.
Regarding usage, JWT is used at an Internet scale. This highlights the ease of client side processing of JWTs on multiple platforms, especially, mobile.
```

**wtf is servlet**
```
A Java servlet is a Java class that extends the capabilities of servers hosting applications accessed via a request-response model, most commonly used to extend web server functionality.
 It is a server-side component that processes client requests, typically HTTP requests, and generates dynamic responses.
 Servlets implement the Servlet interface defined in the javax.servlet package, with most HTTP-specific servlets extending the HttpServlet class, which provides methods like doGet and doPost to handle specific HTTP operations.
 They are managed by a servlet container (such as Apache Tomcat), which handles lifecycle management, request routing, and resource allocation, allowing servlets to efficiently handle multiple concurrent requests.
 The servlet lifecycle includes initialization via the init method, servicing requests through the service method, and cleanup via the destroy method
```

```
Modules (NgModule):
The old Angular structure where every component, directive, and pipe must be declared inside a module (like AppModule). You organize features in separate modules (e.g., UserModule, AuthModule) and import them into others.

Standalone components:
A newer, simpler approach (Angular 14+) where components don’t need to be declared in a module. Instead, they are self-contained — you just mark them with standalone: true and directly import other standalone components or Angular features inside them.

👉 In essence:
Modules = grouped structure (traditional, modular).
Standalone = self-contained, modularity built into the component itself.
```

**wtf is DispatcherServlet**
```
The DispatcherServlet is a front controller in the Spring MVC framework that handles all incoming HTTP requests, acting as the central dispatcher for a web application. It routes these requests to the appropriate Spring MVC controllers, orchestrates the request-handling process, and integrates other components like view resolvers to produce the final response. 
Key functions of the DispatcherServlet:
Handles all requests: It is the single entry point for every request to the web application, ensuring a centralized way to manage incoming traffic.
Routes requests: It uses information from the request to determine which controller is responsible for handling it, much like a traffic director.
Manages the request lifecycle: It coordinates the entire process, from handling the initial request to preparing and rendering the final response.
Integrates with other components: It works with other components in the Spring MVC framework, such as handler adapters, handler mappings, and view resolvers, to process the request and generate the correct view.
Component of the Spring MVC architecture: It is a core and essential part of the Spring MVC framework's architecture, responsible for the request-handling logic
```
wtf is AbstractHandlerMethodAdapter

**old approach**
```java
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class SimpleHttpServer {
    public static void main(String[] args) {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
            server.createContext("/", new MyHandler());
            server.setExecutor(null);
            server.start();
            System.out.println("Server is running on port 8000");
        } catch (IOException e) {
            System.out.println("Error starting the server: " + e.getMessage());
        }
    }

    static class MyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "Hello, this is a simple HTTP server response!";
            exchange.sendResponseHeaders(200, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}   
```

**wtf is a bean**
```
What is a Spring Bean?

A bean is an object whose lifecycle (creation, initialization, destruction) is controlled by Spring’s IoC container. 
In Spring’s terminology:
“the objects that form the backbone of your application and that are managed by the Spring IoC container are called beans.” 
Baeldung on Kotlin
When you declare a class (via annotations or configuration) for Spring to pick up and manage, you’re turning that class into a bean.
```

```
Simple definition
DSL = a specialized syntax that makes a complicated task readable and easy.
Examples:
SQL is a DSL for databases
HTML is a DSL for documents
Regex is a DSL for pattern matching
Spring Security config is a DSL for security rules
```
```java
class Observable {
    constructor() {
        this.observers = [];
    }

    subscribe(func) {
        this.observers.push(func);
    }

    unsubscribe(func) {
        this.observers = this.observers.filter(observer => observer !== func);
    }

    notify(data) {
        this.observers.forEach(observer => observer(data));
    }
}   
```

```
📌 TL;DR

AOP lets you add common behaviors (like logging, security, transactions) to many parts of your app without editing each method — like applying a building-wide rule instead of editing every room.
```

**Unified Modeling Language**
```
software system design modeling tool
UML stands for Unified Modeling Language.
 It is a standardized modeling language used to visualize, specify, construct, and document the artifacts of software systems and other complex systems.
 The language provides a set of graphical notations to represent different aspects of a system, such as its structure, behavior, and interactions.
```