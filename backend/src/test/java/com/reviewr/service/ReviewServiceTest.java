package com.reviewr.service;

import com.reviewr.dto.ReviewDTO;
import com.reviewr.model.Review;
import com.reviewr.model.Snippet;
import com.reviewr.model.User;
import com.reviewr.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock UserService userService;
    @Mock SnippetService snippetService;
    @InjectMocks ReviewService reviewService;

    private User alice;
    private User bob;
    private Snippet snippet;

    @BeforeEach
    void setUp() {
        alice = user(1L, "alice");
        bob = user(2L, "bob");
        snippet = new Snippet();
        snippet.setId(10L);
        snippet.setTitle("Binary search");
    }

    @Test
    void authorCanDeleteOwnReview() {
        Review review = review(5L, alice);
        when(reviewRepository.findById(5L)).thenReturn(Optional.of(review));

        reviewService.deleteReview(5L, alice);

        verify(reviewRepository).delete(review);
    }

    @Test
    void otherUserCannotDeleteReview() {
        when(reviewRepository.findById(5L)).thenReturn(Optional.of(review(5L, alice)));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> reviewService.deleteReview(5L, bob));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(reviewRepository, never()).delete(any());
    }

    @Test
    void createIgnoresIdAndUserFromRequest() {
        Review incoming = review(99L, bob); // client tries to overwrite review 99 as bob
        incoming.setComment("  Nice  ");
        when(snippetService.getSnippetById(10L)).thenReturn(snippet);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewDTO dto = reviewService.createReview(incoming, alice);

        ArgumentCaptor<Review> saved = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(saved.capture());
        assertNull(saved.getValue().getId());
        assertEquals(alice, saved.getValue().getUser());
        assertEquals("Nice", dto.getComment());
        assertEquals("alice", dto.getAuthorName());
    }

    private Review review(Long id, User author) {
        Review r = new Review();
        r.setId(id);
        r.setUser(author);
        r.setSnippet(snippet);
        r.setRating(4);
        r.setComment("Good");
        return r;
    }

    private static User user(Long id, String name) {
        User u = new User();
        u.setId(id);
        u.setUsername(name);
        u.setEmail(name + "@example.com");
        return u;
    }
}
