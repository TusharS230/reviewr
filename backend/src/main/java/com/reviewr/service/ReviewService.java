package com.reviewr.service;

import com.reviewr.dto.ReviewDTO;
import com.reviewr.model.Review;
import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final SnippetService snippetService;

    public ReviewService(ReviewRepository reviewRepository,
                         UserService userService,
                         SnippetService snippetService) {
        this.reviewRepository = reviewRepository;
        this.userService = userService;
        this.snippetService = snippetService;
    }

    public ReviewDTO createReview(Review review, User author) {
        Snippet targetSnippet = snippetService.getSnippetById(review.getSnippet().getId());

        // Ignore any id sent by the client, otherwise a POST could overwrite someone else's review
        review.setId(null);
        review.setComment(review.getComment().trim());
        review.setUser(author);
        review.setSnippet(targetSnippet);

        return toDto(reviewRepository.save(review));
    }

    public List<ReviewDTO> getReviewsBySnippetId(Long snippetId) {
        snippetService.getSnippetById(snippetId);
        return reviewRepository.findBySnippetId(snippetId).stream().map(this::toDto).toList();
    }

    public List<ReviewDTO> getReviewsByUserId(Long userId) {
        userService.getUserById(userId);
        return reviewRepository.findByUserId(userId).stream().map(this::toDto).toList();
    }

    // Only the person who wrote a review can delete it
    public void deleteReview(Long id, User currentUser) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own reviews");
        }
        reviewRepository.delete(review);
    }

    private ReviewDTO toDto(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setComment(review.getComment());
        dto.setRating(review.getRating());
        dto.setAuthorName(review.getUser().getUsername());
        dto.setSnippetTitle(review.getSnippet().getTitle());
        return dto;
    }
}
