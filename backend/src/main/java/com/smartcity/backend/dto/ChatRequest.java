package com.smartcity.backend.dto;

public class ChatRequest {
    private String message;
    private String cityId;
    private String cityName;

    public ChatRequest() {}

    public ChatRequest(String message, String cityId, String cityName) {
        this.message = message;
        this.cityId = cityId;
        this.cityName = cityName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCityId() {
        return cityId;
    }

    public void setCityId(String cityId) {
        this.cityId = cityId;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }
}
