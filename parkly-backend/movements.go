package main

import (
	"encoding/json"
	"net/http"
)

func (s *Server) handleGetMovements(w http.ResponseWriter, r *http.Request) {
	movements := s.Store.GetMovements()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(movements)
}