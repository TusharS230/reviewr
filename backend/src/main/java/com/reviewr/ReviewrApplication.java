package com.reviewr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class ReviewrApplication {

	public static void main(String[] args) {
		// Store and send all times in UTC, so "2 hours ago" is right on every machine.
		// The browser converts UTC to the viewer's own time zone.
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		SpringApplication.run(ReviewrApplication.class, args);
	}

}
