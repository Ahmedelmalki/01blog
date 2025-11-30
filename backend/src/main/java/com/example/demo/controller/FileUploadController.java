package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.tika.Tika;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;


@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:4200")
public class FileUploadController {

    private final Tika tika = new Tika();

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    @PostMapping("/upload/public")
    public ResponseEntity<?> uploadPublicFile(@RequestParam("file") MultipartFile file) {
        return handleFileUpload(file, true);
    }
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        return handleFileUpload(file, false);
    }

    private ResponseEntity<?> handleFileUpload(MultipartFile file, boolean isPublic) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Please select a file to upload"));
            }

            long maxSize = isPublic ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("File size must be less than " + (maxSize / 1024 / 1024) + "MB"));
            }

            if (!isValidFileType(file, isPublic)) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse(isPublic 
                        ? "Only image files are allowed for profile pictures" 
                        : "Invalid file type"));
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:" + serverPort + "/api/files/" + uniqueFilename;

            Map<String, Object> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);
            response.put("size", file.getSize());
            response.put("contentType", file.getContentType());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to upload file: " + e.getMessage()));
        }
    }

    private boolean isValidFileType(MultipartFile file, boolean isPublic){
        try {
            String detectedType = tika.detect(file.getInputStream());            
            if (isPublic) {
                return detectedType.startsWith("image/");
            } else {
                return detectedType.startsWith("image/") || detectedType.startsWith("video/");
            }
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

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