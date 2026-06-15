package com.ps06.knowledgeportal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ps06.knowledgeportal.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
}
