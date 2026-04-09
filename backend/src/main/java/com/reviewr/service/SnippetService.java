package com.reviewr.service;

import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.repository.SnippetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SnippetService {

    private final SnippetRepository snippetRepository;
    private final UserService userService;

    public SnippetService(SnippetRepository snippetRepository, UserService userService) {
        this.snippetRepository = snippetRepository;
        this.userService = userService;
    }

    public Snippet saveSnippet(Snippet snippet) {
        User author = userService.getUserById(snippet.getUser().getId());
        snippet.setUser(author);
        return snippetRepository.save(snippet);
    }

    public Snippet getSnippetById(Long id) {
        return snippetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Snippet not found"));
    }

    public List<Snippet> getSnippetByLanguage(String language) {
        return snippetRepository.findByLanguage(language);
    }

    public List<Snippet> getAllSnippets() {
        return snippetRepository.findAll();
    }

    public List<Snippet> getSnippetsByUserId(Long userId) {
        return snippetRepository.findByUserId(userId);
    }

    public List<Snippet> getSnippetsByUserIdAndLanguage(Long userId, String language) {
        return snippetRepository.findByUserIdAndLanguage(userId, language);
    }
}
