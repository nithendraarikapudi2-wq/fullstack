package com.ps06.knowledgeportal.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        HttpServletRequest requestToProcess = request;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Map<String, String> claims = jwtUtil.validateAndExtract(token);
            if (claims != null) {
                HeaderRequestWrapper wrapper = new HeaderRequestWrapper(request);
                wrapper.putHeader("X-User-Email", claims.get("email"));
                wrapper.putHeader("X-User-Role", claims.get("role"));
                wrapper.putHeader("X-User-Name", claims.get("name"));
                requestToProcess = wrapper;
            }
        }

        filterChain.doFilter(requestToProcess, response);
    }
}
