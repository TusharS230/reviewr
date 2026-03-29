package com.reviewr.service;

import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.repository.SnippetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
