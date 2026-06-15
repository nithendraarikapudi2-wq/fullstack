package com.ps06.knowledgeportal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ps06.knowledgeportal.dto.DocumentRequest;
import com.ps06.knowledgeportal.dto.DocumentResponse;
import com.ps06.knowledgeportal.model.Author;
import com.ps06.knowledgeportal.model.Category;
import com.ps06.knowledgeportal.model.Document;
import com.ps06.knowledgeportal.repository.AuthorRepository;
import com.ps06.knowledgeportal.repository.CategoryRepository;
import com.ps06.knowledgeportal.repository.DocumentRepository;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;

    public DocumentService(
            DocumentRepository documentRepository,
            CategoryRepository categoryRepository,
            AuthorRepository authorRepository
    ) {
        this.documentRepository = documentRepository;
        this.categoryRepository = categoryRepository;
        this.authorRepository = authorRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listDocuments() {
        return documentRepository.findAllWithRelations().stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional
    public DocumentResponse createDocument(DocumentRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Document document = new Document();
        document.setTitle(request.title());
        document.setSummary(request.summary());
        document.setBody(request.body());
        document.setType(request.type());
        document.setTags(request.tags());
        document.setCategory(category);

        if (request.authorName() != null && !request.authorName().isBlank()) {
            Author author = authorRepository.findByNameIgnoreCase(request.authorName().trim())
                    .orElseGet(() -> createAuthor(request.authorName().trim()));
            document.setAuthor(author);
        }

        return DocumentResponse.from(documentRepository.save(document));
    }

    @Transactional
    public void deleteDocument(Long id) {
        if (!documentRepository.existsById(id)) {
            throw new IllegalArgumentException("Document not found");
        }

        documentRepository.deleteById(id);
    }

    private Author createAuthor(String name) {
        Author author = new Author();
        author.setName(name);
        return authorRepository.save(author);
    }
}
