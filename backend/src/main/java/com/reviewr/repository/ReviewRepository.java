package com.reviewr.repository;

import com.reviewr.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findBySnippetId(Long snippetId);
    List<Review> findByUserId(Long userId);
}
