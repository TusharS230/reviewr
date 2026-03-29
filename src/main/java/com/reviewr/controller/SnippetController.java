package com.reviewr.controller;

import com.reviewr.model.Snippet;
import com.reviewr.service.SnippetService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/api/snippets")
public class SnippetController {

    private final SnippetService snippetService;
    public SnippetController(SnippetService snippetService) {
        this.snippetService = snippetService;
    }

    @PostMapping
    public Snippet createSnippet(@RequestBody Snippet snippet) {
        return snippetService.saveSnippet(snippet);
    }
}
