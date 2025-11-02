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