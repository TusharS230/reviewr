package com.reviewr.controller;

import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.repository.UserRepository;
import com.reviewr.service.SnippetService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/snippets")
public class SnippetController {

    private final SnippetService snippetService;
    private final UserRepository userRepository; // 1. Added the Repository

    // 2. Injected the Repository into the constructor
    public SnippetController(SnippetService snippetService, UserRepository userRepository) {
        this.snippetService = snippetService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Snippet createSnippet(@RequestBody Snippet snippet) {
        // A. Ask the Bouncer who is currently holding the VIP ticket
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInEmail = authentication.getName(); // Pulls the email from the JWT

        // B. Find that user in the database
        User currentUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // C. Attach the user to the snippet so it isn't "faceless" anymore
        snippet.setUser(currentUser);

        // D. Save it securely!
        return snippetService.saveSnippet(snippet);
    }

    // Kept your excellent custom language filtering logic exactly as it was!
    @GetMapping
    public List<Snippet> getSnippets(@RequestParam(name = "lang", required = false) String lang) {
        if(lang != null) {
            return snippetService.getSnippetByLanguage(lang);
        }
        return snippetService.getAllSnippets();
    }
}