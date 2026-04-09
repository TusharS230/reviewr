package com.reviewr.controller;

import com.reviewr.dto.ReviewDTO;
import com.reviewr.model.Review;
import com.reviewr.model.User;
import com.reviewr.repository.UserRepository;
import com.reviewr.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;
    private final UserRepository userRepository; // 1. Add the UserRepository

    // 2. Inject BOTH into the constructor
    public ReviewController(ReviewService reviewService, UserRepository userRepository) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Review createReview(@Valid @RequestBody Review review) {
        // A. Ask the Bouncer who is currently holding the VIP ticket
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInEmail = authentication.getName(); // Pulls the email from the JWT

        // B. Find that user in the database
        User currentUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // C. Attach the user to the review so it knows who wrote it!
        review.setUser(currentUser);

        // D. Save it
        return reviewService.saveReview(review);
    }

    // --- The rest stays exactly the same ---

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

    // THE NEW "MY REVIEWS" ENDPOINT
    @GetMapping("/my-reviews")
    public List<ReviewDTO> getMyReviews() {
        // 1. Ask the Bouncer who is holding the VIP ticket
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String loggedInEmail = authentication.getName();

        // 2. Find that user in the database
        User currentUser = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Use the existing service to get reviews for this specific user
        return reviewService.getReviewsByUserId(currentUser.getId());
    }
}