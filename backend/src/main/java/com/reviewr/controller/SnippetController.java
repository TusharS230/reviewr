package com.reviewr.controller;

import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.service.SnippetService;
import com.reviewr.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/snippets")
public class SnippetController {

    private final SnippetService snippetService;
    private final UserService userService;

    public SnippetController(SnippetService snippetService, UserService userService) {
        this.snippetService = snippetService;
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Snippet createSnippet(@Valid @RequestBody Snippet snippet, Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        return snippetService.createSnippet(snippet, currentUser);
    }

    @GetMapping
    public List<Snippet> getSnippets(@RequestParam(name = "lang", required = false) String lang) {
        if (lang != null && !lang.isBlank()) {
            return snippetService.getSnippetByLanguage(lang);
        }
        return snippetService.getAllSnippets();
    }

    @GetMapping("/my-snippets")
    public List<Snippet> getMySnippets(@RequestParam(name = "lang", required = false) String lang,
                                       Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        if (lang != null && !lang.isBlank()) {
            return snippetService.getSnippetsByUserIdAndLanguage(currentUser.getId(), lang);
        }
        return snippetService.getSnippetsByUserId(currentUser.getId());
    }
}
