package com.reviewr.repository;

import com.reviewr.model.Snippet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SnippetRepository extends JpaRepository<Snippet, Long> {
    List<Snippet> findByLanguage(String language);
}