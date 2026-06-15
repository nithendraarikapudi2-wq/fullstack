package com.ps06.knowledgeportal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ps06.knowledgeportal.model.Document;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("""
            select d from Document d
            join fetch d.category c
            left join fetch d.author a
            where lower(d.title) like lower(concat('%', :query, '%'))
               or lower(d.summary) like lower(concat('%', :query, '%'))
               or lower(d.body) like lower(concat('%', :query, '%'))
               or lower(coalesce(d.tags, '')) like lower(concat('%', :query, '%'))
               or lower(c.name) like lower(concat('%', :query, '%'))
            order by d.createdAt desc
            """)
    List<Document> keywordSearch(@Param("query") String query);

    @Query("""
            select d from Document d
            join fetch d.category c
            left join fetch d.author a
            order by d.createdAt desc
            """)
    List<Document> findAllWithRelations();
}
