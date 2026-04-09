package com.reviewr.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewDTO {
    private Long id;
    private String comment;
    private int rating;
    private String authorName;
    private String snippetTitle;
}
