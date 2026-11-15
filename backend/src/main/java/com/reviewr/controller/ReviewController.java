package com.reviewr.controller;

import com.reviewr.dto.ReviewDTO;
import com.reviewr.model.Review;
import com.reviewr.model.User;
import com.reviewr.service.ReviewService;
import com.reviewr.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;
    private final UserService userService;

    public ReviewController(ReviewService reviewService, UserService userService) {
        this.reviewService = reviewService;
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDTO createReview(@Valid @RequestBody Review review, Authentication authentication) {
        // The author always comes from the JWT, never from the request body
        User currentUser = userService.getUserByEmail(authentication.getName());
        return reviewService.createReview(review, currentUser);
    }

    @GetMapping("/snippet/{snippetId}")
    public List<ReviewDTO> getReviewsForSnippet(@PathVariable Long snippetId) {
        return reviewService.getReviewsBySnippetId(snippetId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable Long id, Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        reviewService.deleteReview(id, currentUser);
        return ResponseEntity.ok(Collections.singletonMap("message", "Review deleted"));
    }

    @GetMapping("/user/{userId}")
    public List<ReviewDTO> getReviewsByUser(@PathVariable Long userId) {
        return reviewService.getReviewsByUserId(userId);
    }

    @GetMapping("/my-reviews")
    public List<ReviewDTO> getMyReviews(Authentication authentication) {
        User currentUser = userService.getUserByEmail(authentication.getName());
        return reviewService.getReviewsByUserId(currentUser.getId());
    }
}
