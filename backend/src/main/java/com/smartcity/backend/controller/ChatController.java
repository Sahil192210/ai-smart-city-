package com.smartcity.backend.controller;

import com.smartcity.backend.dto.ChatRequest;
import com.smartcity.backend.dto.ChatResponse;
import com.smartcity.backend.service.GeminiAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "*"})
public class ChatController {

    private final GeminiAiService geminiAiService;

    @Autowired
    public ChatController(GeminiAiService geminiAiService) {
        this.geminiAiService = geminiAiService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Smart City Spring Boot Backend",
                "aiEngine", "Gemini 1.5 Flash + Search Grounding",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String msg = request.getMessage();
        if (msg == null || msg.trim().isEmpty()) {
            msg = "Hello";
        }
        ChatResponse response = geminiAiService.processQuery(
                msg,
                request.getCityId() != null ? request.getCityId() : "pune",
                request.getCityName() != null ? request.getCityName() : "Pune"
        );
        return ResponseEntity.ok(response);
    }
}
