package com.ps06.knowledgeportal.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ps06.knowledgeportal.config.JwtUtil;
import com.ps06.knowledgeportal.dto.AuthRequest;
import com.ps06.knowledgeportal.dto.AuthResponse;
import com.ps06.knowledgeportal.model.AppUser;
import com.ps06.knowledgeportal.repository.AppUserRepository;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(AppUserRepository appUserRepository, JwtUtil jwtUtil) {
        this.appUserRepository = appUserRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse signUp(AuthRequest request) {
        String email = request.email().trim().toLowerCase();
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        AppUser user = new AppUser();
        user.setFullName(resolveName(request.fullName(), email));
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        
        if (email.startsWith("admin")) {
            user.setRole("ADMIN");
        } else if (email.startsWith("author")) {
            user.setRole("AUTHOR");
        } else {
            user.setRole("READER");
        }

        AppUser savedUser = appUserRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole(), savedUser.getFullName());
        return AuthResponse.from(savedUser, token, "Account created");
    }

    @Transactional(readOnly = true)
    public AuthResponse signIn(AuthRequest request) {
        AppUser user = appUserRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getFullName());
        return AuthResponse.from(user, token, "Signed in");
    }

    private String resolveName(String fullName, String email) {
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim();
        }
        return email.substring(0, email.indexOf('@'));
    }
}
