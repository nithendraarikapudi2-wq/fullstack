package com.ps06.knowledgeportal.dto;

import com.ps06.knowledgeportal.model.DocumentType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DocumentRequest(
        @NotBlank String title,
        @NotBlank String summary,
        @NotBlank String body,
        @NotNull DocumentType type,
        String authorName,
        @NotNull Long categoryId,
        String tags
) {
}
