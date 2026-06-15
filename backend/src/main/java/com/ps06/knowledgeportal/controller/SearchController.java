package com.ps06.knowledgeportal.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ps06.knowledgeportal.dto.DocumentResponse;
import com.ps06.knowledgeportal.service.SearchService;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public List<DocumentResponse> keywordSearch(@RequestParam String query) {
        return searchService.keywordSearch(query);
    }

    @GetMapping("/semantic")
    public List<DocumentResponse> semanticSearch(@RequestParam String query) {
        return searchService.semanticSearch(query);
    }
}
