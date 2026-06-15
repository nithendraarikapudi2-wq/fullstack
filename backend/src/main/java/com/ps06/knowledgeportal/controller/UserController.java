package com.ps06.knowledgeportal.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ps06.knowledgeportal.dto.UserResponse;
import com.ps06.knowledgeportal.model.AppUser;
import com.ps06.knowledgeportal.repository.AppUserRepository;
import com.ps06.knowledgeportal.service.AdminAccessService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AppUserRepository appUserRepository;
    private final AdminAccessService adminAccessService;

    public UserController(AppUserRepository appUserRepository, AdminAccessService adminAccessService) {
        this.appUserRepository = appUserRepository;
        this.adminAccessService = adminAccessService;
    }

    @GetMapping
    public List<UserResponse> listUsers(
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        adminAccessService.requireAdmin(email, role);
        return appUserRepository.findAll().stream()
                .map(UserResponse::from)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReader(
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @PathVariable Long id
    ) {
        adminAccessService.requireAdmin(email, role);
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!"READER".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Only reader accounts can be deleted here");
        }

        appUserRepository.delete(user);
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
