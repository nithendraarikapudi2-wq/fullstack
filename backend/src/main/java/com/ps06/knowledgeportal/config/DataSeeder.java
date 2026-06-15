package com.ps06.knowledgeportal.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.ps06.knowledgeportal.model.Author;
import com.ps06.knowledgeportal.model.Category;
import com.ps06.knowledgeportal.model.Document;
import com.ps06.knowledgeportal.model.DocumentType;
import com.ps06.knowledgeportal.model.AppUser;
import com.ps06.knowledgeportal.repository.AppUserRepository;
import com.ps06.knowledgeportal.repository.AuthorRepository;
import com.ps06.knowledgeportal.repository.CategoryRepository;
import com.ps06.knowledgeportal.repository.DocumentRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            CategoryRepository categoryRepository,
            AuthorRepository authorRepository,
            DocumentRepository documentRepository,
            AppUserRepository appUserRepository
    ) {
        return args -> {
            if (!appUserRepository.existsByEmailIgnoreCase("admin@knowledge.local")) {
                AppUser admin = new AppUser();
                admin.setFullName("Portal Admin");
                admin.setEmail("admin@knowledge.local");
                admin.setPasswordHash(new BCryptPasswordEncoder().encode("admin123"));
                admin.setRole("ADMIN");
                appUserRepository.save(admin);
            }

            if (categoryRepository.count() == 0) {
                createCategory(categoryRepository, "Architecture", "System design and software architecture");
                createCategory(categoryRepository, "Cloud", "Cloud deployment and operations");
                createCategory(categoryRepository, "Database", "Data modelling and storage references");
                createCategory(categoryRepository, "Accessibility", "Inclusive content and UI guidance");
            }

            if (documentRepository.count() == 0) {
                Author asha = createAuthor(authorRepository, "Asha Menon");
                Author rahul = createAuthor(authorRepository, "Rahul Verma");

                createDocument(
                        documentRepository,
                        categoryRepository.findByNameIgnoreCase("Architecture").orElseThrow(),
                        asha,
                        "Microservices Architecture Concepts",
                        "Bounded contexts, independent deployment, API gateways, service discovery, and observability.",
                        "Microservices architecture organizes software as small independently deployable services. Each service owns a bounded business capability and communicates through lightweight APIs.",
                        "microservices,services,architecture",
                        DocumentType.ARTICLE
                );

                createDocument(
                        documentRepository,
                        categoryRepository.findByNameIgnoreCase("Cloud").orElseThrow(),
                        rahul,
                        "Cloud Deployment Strategies",
                        "Blue-green, rolling, canary, immutable infrastructure, and rollback planning for reliable cloud releases.",
                        "Cloud deployment strategies reduce release risk by controlling rollout speed, monitoring health, and keeping rollback paths available.",
                        "cloud,deployment,devops",
                        DocumentType.REFERENCE
                );
            }
        };
    }

    private Category createCategory(CategoryRepository repository, String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return repository.save(category);
    }

    private Author createAuthor(AuthorRepository repository, String name) {
        Author author = new Author();
        author.setName(name);
        return repository.save(author);
    }

    private void createDocument(
            DocumentRepository repository,
            Category category,
            Author author,
            String title,
            String summary,
            String body,
            String tags,
            DocumentType type
    ) {
        Document document = new Document();
        document.setCategory(category);
        document.setAuthor(author);
        document.setTitle(title);
        document.setSummary(summary);
        document.setBody(body);
        document.setTags(tags);
        document.setType(type);
        repository.save(document);
    }
}
