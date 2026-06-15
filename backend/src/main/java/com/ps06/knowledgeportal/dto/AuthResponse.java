package com.ps06.knowledgeportal.dto;

import com.ps06.knowledgeportal.model.AppUser;

public record AuthResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String message,
        String token
) {
    public static AuthResponse from(AppUser user, String token, String message) {
        return new AuthResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                message,
                token
        );
    }
}
