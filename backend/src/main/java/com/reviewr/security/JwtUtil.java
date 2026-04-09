package com.reviewr.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Grabs the secret key you just put in application.properties
    @Value("${jwt.secret}")
    private String secret;

    // Converts your string secret into a cryptographic Key object
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // 1. Generate a new VIP Wristband (Token)
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // The "Name tag" on the wristband
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Expires in 24 hours
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Sign it with the master key
                .compact();
    }

    // 2. Read the Name Tag (Extract Email from Token)
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. Verify the Wristband isn't fake or expired
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false; // If the signature fails or it's expired, it throws an exception
        }
    }
}