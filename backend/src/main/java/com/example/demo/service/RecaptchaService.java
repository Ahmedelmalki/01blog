package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Service
public class RecaptchaService {
    @Value("${recaptcha.secret}")
    private String secretKey;

    @Value("${recaptcha.verify.url}")
    private String verifyUrl;

    public boolean verify(String captchaResponse) {
        if (captchaResponse == null || captchaResponse.isEmpty()) return false;

        RestTemplate restTemplate = new RestTemplate();
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", secretKey);
        params.add("response", captchaResponse);

        try {
            RecaptchaResponse response = restTemplate.postForObject(verifyUrl, params, RecaptchaResponse.class);
            return response != null && response.isSuccess();
        } catch (Exception e) {
            return false;
        }
    }

    @Data
    private static class RecaptchaResponse {
        private boolean success;
        @JsonProperty("challenge_ts")
        private String challengeTs;
        private String hostname;
        @JsonProperty("error-codes")
        private String[] errorCodes;
    }
}