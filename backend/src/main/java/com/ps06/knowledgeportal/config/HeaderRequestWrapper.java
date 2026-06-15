package com.ps06.knowledgeportal.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HeaderRequestWrapper extends HttpServletRequestWrapper {
    private final Map<String, String> customHeaders = new HashMap<>();

    public HeaderRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    public void putHeader(String name, String value) {
        this.customHeaders.put(name.toLowerCase(), value);
    }

    @Override
    public String getHeader(String name) {
        String customValue = customHeaders.get(name.toLowerCase());
        if (customValue != null) {
            return customValue;
        }
        return super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        List<String> names = Collections.list(super.getHeaderNames());
        for (String customName : customHeaders.keySet()) {
            if (!names.contains(customName)) {
                names.add(customName);
            }
        }
        return Collections.enumeration(names);
    }
}
