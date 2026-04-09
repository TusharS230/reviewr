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
    private final UserRepository userRepository;

    public SnippetController(SnippetService snippetService, UserRepository userRepository) {
        this.snippetService = snippetService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Snippet createSnippet(@RequestBody Snippet snippet) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        snippet.setUser(currentUser);
        return snippetService.saveSnippet(snippet);
    }

    @GetMapping
    public List<Snippet> getSnippets(@RequestParam(name = "lang", required = false) String lang) {
        if (lang != null) {
            return snippetService.getSnippetByLanguage(lang);
        }
        return snippetService.getAllSnippets();
    }

    @GetMapping("/my-snippets")
    public List<Snippet> getMySnippets(@RequestParam(name = "lang", required = false) String lang) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (lang != null) {
            return snippetService.getSnippetsByUserIdAndLanguage(currentUser.getId(), lang);
        }
        return snippetService.getSnippetsByUserId(currentUser.getId());
    }
}