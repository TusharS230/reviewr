package com.reviewr.model;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity @Getter @Setter @Table(name = "users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username cannot be empty")
    private String username;

    @NotBlank(message = "Email should be valid")
    @Column(unique = true, nullable = false)
    private String email;

//    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy="user")
    @JsonManagedReference
    private List<Snippet> snippets;
}