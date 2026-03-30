package com.reviewr.service;

import com.reviewr.model.Review;
import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.repository.ReviewRepository;
import com.reviewr.repository.SnippetRepository;
import org.springframework.stereotype.Service;

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
}
