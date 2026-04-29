package main

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (s *Server) handleGetSlots(w http.ResponseWriter, r *http.Request) {
	slots := s.Store.GetSlots()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(slots)
}

func (s *Server) handleCreateSlot(w http.ResponseWriter, r *http.Request) {
	var sl Slot
	if err := json.NewDecoder(r.Body).Decode(&sl); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	created := s.Store.AddSlot(sl)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}

func (s *Server) handleUpdateSlot(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var sl Slot
	if err := json.NewDecoder(r.Body).Decode(&sl); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if ok := s.Store.UpdateSlot(id, sl); !ok {
		http.Error(w, "slot not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sl)
}

func (s *Server) handleDeleteSlot(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if ok := s.Store.DeleteSlot(id); !ok {
		http.Error(w, "slot not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
