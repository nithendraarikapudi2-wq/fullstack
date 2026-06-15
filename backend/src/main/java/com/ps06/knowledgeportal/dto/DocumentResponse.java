package com.ps06.knowledgeportal.dto;

import java.time.LocalDateTime;

import com.ps06.knowledgeportal.model.Document;
import com.ps06.knowledgeportal.model.DocumentType;

public record DocumentResponse(
        Long id,
        String title,
        String summary,
        String body,
        DocumentType type,
        String authorName,
        String categoryName,
        String tags,
        LocalDateTime createdAt
) {
    public static DocumentResponse from(Document document) {
        String authorName = document.getAuthor() == null ? "Unknown author" : document.getAuthor().getName();
        return new DocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getSummary(),
                document.getBody(),
                document.getType(),
                authorName,
                document.getCategory().getName(),
                document.getTags(),
                document.getCreatedAt()
        );
    }
}
