package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

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
    private String uploadsDir;

    private static final long Max_vid_size = 50 * 1024 * 1024;
    private static final long Max_img_size = 50 * 1024 * 1024;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file){
        System.out.println("######### enterd ##############\n\n\n\n\n######### enterd ##############");
        if (file.isEmpty()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        if (originalFilename == null || contentType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid file");
        }
        if (!isValidFileType(contentType)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid file type");
        }
        validateFileSize(file.getSize(), contentType);

        try {
            Path uploadsPath = Paths.get(uploadsDir);
        System.out.println("📁 Upload directory: " + uploadsPath.toAbsolutePath());
        System.out.println("📁 Directory exists: " + Files.exists(uploadsPath));
            if (!Files.exists(uploadsPath)){
                Files.createDirectories(uploadsPath);
            }
            String fileExtension = getFileExtension(originalFilename);
            String uf = UUID.randomUUID().toString() + fileExtension;

            Path filePath = uploadsPath.resolve(uf);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("✅ File saved successfully!");

            String fileUrl = "/api/files/"+ uf;
            Map<String, String> response = new HashMap<>();
            response.put("filename", uf);
            response.put("originalFilename", originalFilename);
            response.put("url", fileUrl);
            response.put("contentType", contentType);
            response.put("size", String.valueOf(file.getSize()));
            return ResponseEntity.ok(response);

        } catch(IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
            "failed to upload file: "+e.getMessage());
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename){
        try {
            if (filename.contains("..")||filename.contains("/")|| filename.contains("\\")){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid filename");
            }
            Path filePath = Paths.get(uploadsDir).resolve(filename);
            if (!Files.exists(filePath)){
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "file not found");
            }
            byte[] fileBytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null){
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header("Content-Type",contentType).body(fileBytes);
        } catch (IOException e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
            "failed to red file: "+e.getMessage());
        }
    }

    // helpers
     private void validateFileSize(long size, String contentType) {
        if (contentType.startsWith("video/") && size > Max_vid_size) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Video file size exceeds maximum limit of 50MB");
        }
        if (contentType.startsWith("image/") && size > Max_img_size) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Image file size exceeds maximum limit of 10MB");
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex);
        }
        return "";
    }

       private boolean isValidFileType(String contentType) {
        return contentType.startsWith("image/") || contentType.startsWith("video/");
    }
}