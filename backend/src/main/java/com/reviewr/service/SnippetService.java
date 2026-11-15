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

    public SnippetService(SnippetRepository snippetRepository) {
        this.snippetRepository = snippetRepository;
    }

    public Snippet createSnippet(Snippet snippet, User author) {
        // Ignore any id sent by the client, otherwise a POST could overwrite someone else's snippet
        snippet.setId(null);
        snippet.setCreatedAt(null);
        snippet.setTitle(snippet.getTitle().trim());
        snippet.setLanguage(snippet.getLanguage().trim());
        snippet.setUser(author);
        return snippetRepository.save(snippet);
    }

    public Snippet getSnippetById(Long id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Snippet id is required");
        }
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
