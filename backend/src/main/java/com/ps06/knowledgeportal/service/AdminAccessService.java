package com.ps06.knowledgeportal.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ps06.knowledgeportal.repository.AppUserRepository;

@Service
public class AdminAccessService {

    private final AppUserRepository appUserRepository;

    public AdminAccessService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public void requireAdmin(String email, String role) {
        if (email == null || email.isBlank() || role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            throw new SecurityException("Admin access is required");
        }

        appUserRepository.findByEmailIgnoreCase(email.trim())
                .filter((user) -> "ADMIN".equalsIgnoreCase(user.getRole()))
                .orElseThrow(() -> new SecurityException("Admin access is required"));
    }

    @Transactional(readOnly = true)
    public void requireAuthorOrAdmin(String email, String role) {
        if (email == null || email.isBlank() || role == null || 
            (!"AUTHOR".equalsIgnoreCase(role.trim()) && !"ADMIN".equalsIgnoreCase(role.trim()))) {
            throw new SecurityException("Author or Admin access is required");
        }

        appUserRepository.findByEmailIgnoreCase(email.trim())
                .filter((user) -> "AUTHOR".equalsIgnoreCase(user.getRole()) || "ADMIN".equalsIgnoreCase(user.getRole()))
                .orElseThrow(() -> new SecurityException("Author or Admin access is required"));
    }
}
