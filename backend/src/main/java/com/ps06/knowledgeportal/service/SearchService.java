package com.ps06.knowledgeportal.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ps06.knowledgeportal.dto.DocumentResponse;
import com.ps06.knowledgeportal.model.Document;
import com.ps06.knowledgeportal.repository.DocumentRepository;

@Service
public class SearchService {

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "and", "are", "based", "for", "in", "of", "on", "or", "the", "to", "with"
    );

    private final DocumentRepository documentRepository;

    public SearchService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> keywordSearch(String query) {
        return documentRepository.keywordSearch(query).stream()
                .map(DocumentResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> semanticSearch(String query) {
        List<String> terms = normalize(query);
        return documentRepository.findAllWithRelations().stream()
                .map(document -> new RankedDocument(document, score(document, terms)))
                .filter(result -> result.score() > 0)
                .sorted(Comparator.comparingInt(RankedDocument::score).reversed())
                .map(RankedDocument::document)
                .map(DocumentResponse::from)
                .toList();
    }

    private int score(Document document, List<String> terms) {
        String title = normalizeText(document.getTitle());
        String summary = normalizeText(document.getSummary());
        String body = normalizeText(document.getBody());
        String tags = normalizeText(document.getTags());
        String category = normalizeText(document.getCategory().getName());

        int total = 0;
        for (String term : terms) {
            if (title.contains(term)) {
                total += 6;
            }
            if (summary.contains(term)) {
                total += 4;
            }
            if (tags.contains(term) || category.contains(term)) {
                total += 4;
            }
            if (body.contains(term)) {
                total += 2;
            }
        }
        return total;
    }

    private List<String> normalize(String query) {
        return List.of(normalizeText(query).split("\\s+")).stream()
                .filter(term -> !term.isBlank())
                .filter(term -> !STOP_WORDS.contains(term))
                .collect(Collectors.toList());
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private record RankedDocument(Document document, int score) {
    }
}
