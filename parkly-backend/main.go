package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Server struct {
	Router *chi.Mux
	Store  *Store
}

func NewServer() *Server {
	s := &Server{
		Router: chi.NewRouter(),
		Store:  NewStore(),
	}

	s.Router.Use(middleware.Logger)
	s.Router.Use(middleware.Recoverer)
	s.Router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "http://localhost:8081", "https://courageous-tenderness-production-9ff1.up.railway.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	s.routes()

	return s
}

func (s *Server) routes() {
	s.Router.Post("/api/auth/login", s.handleLogin)
	s.Router.Get("/api/auth/me", s.handleMe)

	s.Router.Get("/api/customers", s.handleGetCustomers)
	s.Router.Post("/api/customers", s.handleCreateCustomer)
	s.Router.Get("/api/customers/{id}", s.handleGetCustomer)
	s.Router.Put("/api/customers/{id}", s.handleUpdateCustomer)
	s.Router.Delete("/api/customers/{id}", s.handleDeleteCustomer)

	s.Router.Get("/api/slots", s.handleGetSlots)
	s.Router.Post("/api/slots", s.handleCreateSlot)
	s.Router.Put("/api/slots/{id}", s.handleUpdateSlot)
	s.Router.Delete("/api/slots/{id}", s.handleDeleteSlot)
	s.Router.Get("/api/movements", s.handleGetMovements)

	s.Router.Get("/api/rates", s.handleGetRates)
	s.Router.Post("/api/rates", s.handleCreateRate)
	s.Router.Put("/api/rates/{id}", s.handleUpdateRate)
	s.Router.Delete("/api/rates/{id}", s.handleDeleteRate)

	s.Router.Post("/api/operations/check-in", s.handleCheckIn)
	s.Router.Post("/api/operations/check-out", s.handleCheckOut)
	
	// Placeholder for other modules
	s.Router.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
}

func main() {
	srv := NewServer()
	log.Println("Starting server on :8080...")
	if err := http.ListenAndServe(":8080", srv.Router); err != nil {
		log.Fatal(err)
	}
}
