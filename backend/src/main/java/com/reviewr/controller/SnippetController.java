package com.reviewr.controller;

import com.reviewr.model.Snippet;
import com.reviewr.service.SnippetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
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

    @GetMapping
    public List<Snippet> getSnippets(@RequestParam(name = "lang", required = false) String lang) {
        if(lang != null) {
            return snippetService.getSnippetByLanguage(lang);
        }
        return snippetService.getAllSnippets();
    }
}
