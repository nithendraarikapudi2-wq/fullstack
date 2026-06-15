package com.ps06.knowledgeportal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ps06.knowledgeportal.dto.DocumentRequest;
import com.ps06.knowledgeportal.dto.DocumentResponse;
import com.ps06.knowledgeportal.service.AdminAccessService;
import com.ps06.knowledgeportal.service.DocumentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final AdminAccessService adminAccessService;

    public DocumentController(DocumentService documentService, AdminAccessService adminAccessService) {
        this.documentService = documentService;
        this.adminAccessService = adminAccessService;
    }

    @GetMapping
    public List<DocumentResponse> listDocuments() {
        return documentService.listDocuments();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DocumentResponse createDocument(
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody DocumentRequest request
    ) {
        adminAccessService.requireAuthorOrAdmin(email, role);
        return documentService.createDocument(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id
    ) {
        adminAccessService.requireAdmin(email, role);
        documentService.deleteDocument(id);
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleForbidden(SecurityException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleBadRequest(IllegalArgumentException exception) {
        return exception.getMessage();
    }
}
