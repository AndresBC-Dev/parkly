package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

func (s *Server) handleGetCustomers(w http.ResponseWriter, r *http.Request) {
	customers := s.Store.GetCustomers()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customers)
}

func (s *Server) handleGetCustomer(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	customer, ok := s.Store.GetCustomer(id)
	if !ok {
		http.Error(w, "customer not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customer)
}

func (s *Server) handleCreateCustomer(w http.ResponseWriter, r *http.Request) {
	var c Customer
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	c.ID = fmt.Sprintf("C-%d", time.Now().Unix())
	c.CreatedAt = time.Now()

	created := s.Store.AddCustomer(c)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}

func (s *Server) handleUpdateCustomer(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var c Customer
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	updated, ok := s.Store.UpdateCustomer(id, c)
	if !ok {
		http.Error(w, "customer not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func (s *Server) handleDeleteCustomer(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if ok := s.Store.DeleteCustomer(id); !ok {
		http.Error(w, "customer not found", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
