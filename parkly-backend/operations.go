package main

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"time"
)

type CheckInRequest struct {
	Plate      string      `json:"plate"`
	Type       VehicleType `json:"type"`
	Owner      string      `json:"owner"`
	CustomerID string      `json:"customerId,omitempty"`
	SlotID     string      `json:"slotId,omitempty"`
}

func (s *Server) handleCheckIn(w http.ResponseWriter, r *http.Request) {
	var req CheckInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	slots := s.Store.GetSlots()
	var targetSlot *Slot

	// 1. Find the target slot
	if req.SlotID != "" {
		for i := range slots {
			if slots[i].ID == req.SlotID && slots[i].Vehicle == nil {
				targetSlot = &slots[i]
				break
			}
		}
	} else {
		for i := range slots {
			if slots[i].Type == req.Type && slots[i].Vehicle == nil {
				targetSlot = &slots[i]
				break
			}
		}
	}

	if targetSlot == nil {
		http.Error(w, "no available slots", http.StatusConflict)
		return
	}

	// 2. Prepare vehicle
	plate := strings.ToUpper(req.Plate)
	
	// Snapshot current active rate for this vehicle type
	rate, ok := s.Store.GetActiveRate(req.Type)
	if !ok {
		// Fallback or error
		http.Error(w, "no rate configured for this vehicle type", http.StatusPreconditionFailed)
		return
	}

	vehicle := &ParkedVehicle{
		Plate:        plate,
		Type:         req.Type,
		Owner:        req.Owner,
		CustomerID:   req.CustomerID,
		EnteredAt:    time.Now(),
		RateSnapshot: rate,
	}

	// Auto-link customer by plate if not provided
	if vehicle.CustomerID == "" {
		customers := s.Store.GetCustomers()
		for _, c := range customers {
			for _, p := range c.Plates {
				if p == plate {
					vehicle.CustomerID = c.ID
					break
				}
			}
			if vehicle.CustomerID != "" {
				break
			}
		}
	}

	// 3. Update Slot
	targetSlot.Vehicle = vehicle
	s.Store.UpdateSlot(targetSlot.ID, *targetSlot)

	// 4. Create Movement
	movement := Movement{
		ID:           fmt.Sprintf("M-%d", time.Now().Unix()),
		Plate:        plate,
		Type:         req.Type,
		Owner:        req.Owner,
		CustomerID:   vehicle.CustomerID,
		SlotID:       targetSlot.ID,
		CheckIn:      vehicle.EnteredAt,
		Currency:     rate.Currency,
		Status:       Active,
		RateSnapshot: rate,
	}
	s.Store.AddMovement(movement)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(targetSlot)
}

func (s *Server) handleCheckOut(w http.ResponseWriter, r *http.Request) {
	slotID := r.URL.Query().Get("slotId")
	if slotID == "" {
		http.Error(w, "missing slotId", http.StatusBadRequest)
		return
	}

	slots := s.Store.GetSlots()
	var targetSlot *Slot
	for i := range slots {
		if slots[i].ID == slotID {
			targetSlot = &slots[i]
			break
		}
	}

	if targetSlot == nil || targetSlot.Vehicle == nil {
		http.Error(w, "slot not occupied or not found", http.StatusNotFound)
		return
	}

	// 1. Calculate amount based on snapshot rate
	rate := targetSlot.Vehicle.RateSnapshot
	duration := time.Since(targetSlot.Vehicle.EnteredAt)
	var amount float64

	switch rate.Unit {
	case Minute:
		amount = duration.Minutes() * rate.Value
	case Hour:
		amount = math.Ceil(duration.Hours()) * rate.Value
	case Day:
		amount = math.Ceil(duration.Hours()/24.0) * rate.Value
	case Fraction:
		f := float64(rate.FractionMin)
		if f <= 0 {
			f = 15 // default 15 min
		}
		amount = math.Ceil(duration.Minutes()/f) * rate.Value
	default:
		amount = math.Ceil(duration.Hours()) * rate.Value // fallback to hour
	}
	amount = math.Round(amount*100) / 100

	// 2. Update Movement
	movements := s.Store.GetMovements()
	for i := range movements {
		if movements[i].SlotID == slotID && movements[i].Status == Active {
			now := time.Now()
			movements[i].Status = Completed
			movements[i].CheckOut = &now
			movements[i].Amount = amount
			movements[i].Currency = rate.Currency
			s.Store.UpdateMovement(movements[i].ID, movements[i])
			break
		}
	}

	// 3. Clear Slot
	targetSlot.Vehicle = nil
	s.Store.UpdateSlot(targetSlot.ID, *targetSlot)

	w.WriteHeader(http.StatusNoContent)
}
