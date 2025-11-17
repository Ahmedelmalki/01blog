package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:4200")
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Public upload endpoint for registration (no authentication required)
     * Limited to profile pictures only
     */
    @PostMapping("/upload/public")
    public ResponseEntity<?> uploadPublicFile(@RequestParam("file") MultipartFile file) {
        return handleFileUpload(file, true);
    }

    /**
     * Protected upload endpoint for authenticated users
     * Can be used for posts, comments, etc.
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        return handleFileUpload(file, false);
    }

    private ResponseEntity<?> handleFileUpload(MultipartFile file, boolean isPublic) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Please select a file to upload"));
            }

            // Validate file size (5MB for public, 10MB for authenticated)
            long maxSize = isPublic ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("File size must be less than " + (maxSize / 1024 / 1024) + "MB"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !isValidFileType(contentType, isPublic)) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse(isPublic 
                        ? "Only image files are allowed for profile pictures" 
                        : "Invalid file type"));
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate URL
            String fileUrl = "http://localhost:" + serverPort + "/api/files/" + uniqueFilename;

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);
            response.put("size", file.getSize());
            response.put("contentType", contentType);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to upload file: " + e.getMessage()));
        }
    }

    private boolean isValidFileType(String contentType, boolean isPublic) {
        if (isPublic) {
            // Only images for public uploads (profile pictures)
            return contentType.startsWith("image/");
        } else {
            // Images and videos for authenticated uploads
            return contentType.startsWith("image/") || contentType.startsWith("video/");
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

    /**
     * Serve uploaded files
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<?> serveFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .body(fileContent);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to serve file: " + e.getMessage()));
        }
    }
}