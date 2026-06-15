package com.ps06.knowledgeportal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ps06.knowledgeportal.model.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
