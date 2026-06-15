package com.ps06.knowledgeportal.dto;

import com.ps06.knowledgeportal.model.AppUser;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        String createdAt
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }
}
