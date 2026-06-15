package com.ps06.knowledgeportal.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    private static final String SECRET = "supersecretkeyknowledgeportalsystemsupersecretkey";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateToken(String email, String role, String fullName) {
        try {
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", email);
            payload.put("role", role);
            payload.put("name", fullName);
            payload.put("exp", System.currentTimeMillis() + 86400000); // 1 day expiration

            String encodedHeader = encodeBase64Url(objectMapper.writeValueAsString(header).getBytes(StandardCharsets.UTF_8));
            String encodedPayload = encodeBase64Url(objectMapper.writeValueAsString(payload).getBytes(StandardCharsets.UTF_8));

            String signatureInput = encodedHeader + "." + encodedPayload;
            String signature = sign(signatureInput, SECRET);

            return signatureInput + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    public Map<String, String> validateAndExtract(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String header = parts[0];
            String payload = parts[1];
            String signature = parts[2];

            String expectedSignature = sign(header + "." + payload, SECRET);
            if (!expectedSignature.equals(signature)) {
                return null;
            }

            byte[] decodedPayloadBytes = decodeBase64Url(payload);
            Map<String, Object> claims = objectMapper.readValue(decodedPayloadBytes, Map.class);

            long exp = ((Number) claims.get("exp")).longValue();
            if (System.currentTimeMillis() > exp) {
                return null;
            }

            Map<String, String> result = new HashMap<>();
            result.put("email", (String) claims.get("sub"));
            result.put("role", (String) claims.get("role"));
            result.put("name", (String) claims.get("name"));
            return result;
        } catch (Exception e) {
            return null;
        }
    }

    private String encodeBase64Url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] decodeBase64Url(String input) {
        return Base64.getUrlDecoder().decode(input);
    }

    private String sign(String input, String secret) throws Exception {
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256HMAC.init(secretKey);
        byte[] hash = sha256HMAC.doFinal(input.getBytes(StandardCharsets.UTF_8));
        return encodeBase64Url(hash);
    }
}
