package com.ps06.knowledgeportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRequest(
        String fullName,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password
) {
}
