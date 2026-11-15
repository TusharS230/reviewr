package com.reviewr.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity @Getter @Setter
public class Snippet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("snippet_title")
    @NotBlank(message = "Title cannot be empty")
    @Size(max = 150, message = "Title can be at most 150 characters")
    private String title;

    @NotBlank(message = "Language is required")
    @Size(max = 30, message = "Language name is too long")
    private String language;

    @NotBlank(message = "Code cannot be empty")
    @Column(columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    // Shown on snippet cards as "by <username>"
    @JsonProperty(value = "authorName", access = JsonProperty.Access.READ_ONLY)
    public String getAuthorName() {
        return user == null ? null : user.getUsername();
    }
}
