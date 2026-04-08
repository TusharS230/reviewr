package com.reviewr.controller;

import com.reviewr.dto.ReviewDTO;
import com.reviewr.model.Review;
import com.reviewr.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public Review createReview(@Valid @RequestBody Review review) {
        return reviewService.saveReview(review);
    }

    @GetMapping("/snippet/{snippetId}")
    public List<ReviewDTO> getReviewsForSnippet(@PathVariable Long snippetId) {
        return reviewService.getReviewsBySnippetId(snippetId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok("Review " + id + " deleted successfully!");
    }

    @GetMapping("/user/{userId}")
    public List<ReviewDTO> getReviewsByUser(@PathVariable Long userId) {
        return reviewService.getReviewsByUserId(userId);
    }
}
