package com.ps06.knowledgeportal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ps06.knowledgeportal.model.Author;

public interface AuthorRepository extends JpaRepository<Author, Long> {
    Optional<Author> findByNameIgnoreCase(String name);
}
