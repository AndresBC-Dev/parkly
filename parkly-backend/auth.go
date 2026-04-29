package main

import (
	"encoding/json"
	"net/http"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Hardcoded for simplicity
	if req.Email == "admin@parkly.io" && req.Password == "admin123" {
		resp := LoginResponse{
			Token: "mock-jwt-token",
			User: User{
				ID:    "U-1",
				Email: req.Email,
				Name:  "Admin User",
				Role:  "admin",
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	http.Error(w, "invalid credentials", http.StatusUnauthorized)
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	// In a real app, we'd check the token
	user := User{
		ID:    "U-1",
		Email: "admin@parkly.io",
		Name:  "Admin User",
		Role:  "admin",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
