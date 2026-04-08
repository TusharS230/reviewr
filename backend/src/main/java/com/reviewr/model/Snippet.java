package com.reviewr.model;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Getter @Setter
public class Snippet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonProperty("snippet_title")
    private String title;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;
}
