package com.smartcity.backend.dto;

import java.util.List;

public class ChatResponse {
    private boolean success;
    private String answer;
    private String source;
    private String suggestedAction;
    private List<String> recommendedActions;
    private String timestamp;

    public ChatResponse() {}

    public ChatResponse(boolean success, String answer, String source, String suggestedAction, List<String> recommendedActions, String timestamp) {
        this.success = success;
        this.answer = answer;
        this.source = source;
        this.suggestedAction = suggestedAction;
        this.recommendedActions = recommendedActions;
        this.timestamp = timestamp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }

    public List<String> getRecommendedActions() {
        return recommendedActions;
    }

    public void setRecommendedActions(List<String> recommendedActions) {
        this.recommendedActions = recommendedActions;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
