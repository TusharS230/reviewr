package com.reviewr.service;

import com.reviewr.dto.ReviewDTO;
import com.reviewr.model.Review;
import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.repository.ReviewRepository;
import com.reviewr.repository.SnippetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
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

    public Review saveReview(Review review) {
        User author = userService.getUserById(review.getUser().getId());
        Snippet targetSnippet = snippetService.getSnippetById(review.getSnippet().getId());

        review.setUser(author);
        review.setSnippet(targetSnippet);

        return reviewRepository.save(review);
    }

    public List<ReviewDTO> getReviewsBySnippetId(Long snippetId) {
        snippetService.getSnippetById(snippetId);
        List<Review> rawReviews = reviewRepository.findBySnippetId(snippetId);
        List<ReviewDTO> cleanReviews = new ArrayList<>();

        for(Review review : rawReviews) {
            ReviewDTO dto = new ReviewDTO();
            dto.setId(review.getId());
            dto.setComment(review.getComment());
            dto.setRating(review.getRating());
            dto.setAuthorName(review.getUser().getUsername());
            dto.setSnippetTitle(review.getSnippet().getTitle());
            cleanReviews.add(dto);
        }
        return cleanReviews;
    }

    public void deleteReview(Long id) {
        if(!reviewRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found with id " + id);
        }
        reviewRepository.deleteById(id);
    }

    public List<ReviewDTO> getReviewsByUserId(Long userId) {
        userService.getUserById(userId);
        List<Review> rawReviews = reviewRepository.findByUserId(userId);
        List<ReviewDTO> cleanReviews = new ArrayList<>();

        for(Review raw : rawReviews) {
            ReviewDTO dto = new ReviewDTO();
            dto.setId(raw.getId());
            dto.setSnippetTitle(raw.getSnippet().getTitle());
            dto.setComment(raw.getComment());
            dto.setRating(raw.getRating());
            dto.setAuthorName(raw.getUser().getUsername());
            cleanReviews.add(dto);
        }
        return cleanReviews;
    }
}
