package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

func (s *Server) handleGetRates(w http.ResponseWriter, r *http.Request) {
	rates := s.Store.GetRates()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rates)
}

func (s *Server) handleCreateRate(w http.ResponseWriter, r *http.Request) {
	var rt Rate
	if err := json.NewDecoder(r.Body).Decode(&rt); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	rt.ID = fmt.Sprintf("R-%d", time.Now().Unix())
	created := s.Store.AddRate(rt)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}

func (s *Server) handleUpdateRate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var rt Rate
	if err := json.NewDecoder(r.Body).Decode(&rt); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if ok := s.Store.UpdateRate(id, rt); !ok {
		http.Error(w, "rate not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rt)
}

func (s *Server) handleDeleteRate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if ok := s.Store.DeleteRate(id); !ok {
		http.Error(w, "rate not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
