package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type VehicleType string

const (
	Sedan      VehicleType = "sedan"
	SUV        VehicleType = "suv"
	Motorcycle VehicleType = "motorcycle"
)

type RateUnit string

const (
	Minute   RateUnit = "minute"
	Hour     RateUnit = "hour"
	Fraction RateUnit = "fraction"
	Day      RateUnit = "day"
)

type Rate struct {
	ID          string      `json:"id"`
	VehicleType VehicleType `json:"vehicleType"`
	Unit        RateUnit    `json:"unit"`
	Value       float64     `json:"value"`
	FractionMin int         `json:"fractionMin,omitempty"`
	Currency    string      `json:"currency"`
}

type Customer struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Plates    []string  `json:"plates"`
	Plan      string    `json:"plan"`
	Notes     string    `json:"notes,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
}

type ParkedVehicle struct {
	Plate        string      `json:"plate"`
	Type         VehicleType `json:"type"`
	Owner        string      `json:"owner"`
	CustomerID   string      `json:"customerId,omitempty"`
	EnteredAt    time.Time   `json:"enteredAt"`
	RateSnapshot Rate        `json:"rateSnapshot"`
}

type Slot struct {
	ID      string         `json:"id"`
	Label   string         `json:"label"`
	Zone    string         `json:"zone"`
	Type    VehicleType    `json:"type"`
	Vehicle *ParkedVehicle `json:"vehicle"`
}

type MovementStatus string

const (
	Active    MovementStatus = "active"
	Completed MovementStatus = "completed"
	Overdue   MovementStatus = "overdue"
)

type Movement struct {
	ID           string         `json:"id"`
	Plate        string         `json:"plate"`
	Type         VehicleType    `json:"type"`
	Owner        string         `json:"owner"`
	CustomerID   string         `json:"customerId,omitempty"`
	SlotID       string         `json:"slot"`
	CheckIn      time.Time      `json:"checkIn"`
	CheckOut     *time.Time     `json:"checkOut"`
	Amount       float64        `json:"amount"`
	Currency     string         `json:"currency"`
	Status       MovementStatus `json:"status"`
	RateSnapshot Rate           `json:"rateSnapshot"`
}

type Store struct {
	db *sql.DB
}

func NewStore() *Store {
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

	if host == "" { host = "localhost" }
	if port == "" { port = "3306" }
	if user == "" { user = "root" }
	if name == "" { name = "parkly" }

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, pass, host, port, name)
	
	var db *sql.DB
	var err error
	
	// Wait for DB to be ready (useful in Docker)
	for i := 0; i < 10; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				break
			}
		}
		log.Printf("Waiting for database... (%d/10)", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("Could not connect to database:", err)
	}

	s := &Store{db: db}
	s.InitDB()
	return s
}

func (s *Store) InitDB() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS roles (
			id INT AUTO_INCREMENT PRIMARY KEY,
			nombre VARCHAR(50) NOT NULL,
			descripcion VARCHAR(255)
		)`,
		`CREATE TABLE IF NOT EXISTS usuarios (
			id INT AUTO_INCREMENT PRIMARY KEY,
			nombre VARCHAR(100) NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			rol_id INT,
			activo TINYINT(1) DEFAULT 1,
			fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS tipos_vehiculo (
			id VARCHAR(50) PRIMARY KEY,
			nombre VARCHAR(50) NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS espacios (
			id VARCHAR(50) PRIMARY KEY,
			label VARCHAR(50) NOT NULL,
			zone VARCHAR(50) NOT NULL,
			tipo_vehiculo_id VARCHAR(50),
			disponible TINYINT(1) DEFAULT 1,
			plate VARCHAR(50),
			owner VARCHAR(100),
			customer_id VARCHAR(50),
			entered_at DATETIME,
			rate_snapshot JSON
		)`,
		`CREATE TABLE IF NOT EXISTS tarifas (
			id VARCHAR(50) PRIMARY KEY,
			tipo_vehiculo_id VARCHAR(50),
			unit ENUM('minute', 'hour', 'fraction', 'day'),
			valor DECIMAL(10,2) NOT NULL,
			fraction_min INT,
			currency VARCHAR(10) DEFAULT 'EUR',
			activo TINYINT(1) DEFAULT 1
		)`,
		`CREATE TABLE IF NOT EXISTS registros (
			id VARCHAR(50) PRIMARY KEY,
			placa VARCHAR(50) NOT NULL,
			tipo_vehiculo_id VARCHAR(50),
			espacio_id VARCHAR(50),
			fecha_hora_entrada DATETIME NOT NULL,
			fecha_hora_salida DATETIME,
			minutos_totales INT,
			amount DECIMAL(10,2),
			currency VARCHAR(10),
			estado ENUM('active', 'completed', 'overdue'),
			rate_snapshot JSON
		)`,
		`CREATE TABLE IF NOT EXISTS customers (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			email VARCHAR(100) NOT NULL,
			phone VARCHAR(50),
			plates JSON,
			plan VARCHAR(50),
			notes TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, q := range queries {
		_, err := s.db.Exec(q)
		if err != nil {
			log.Fatalf("Error creating table: %v\nQuery: %s", err, q)
		}
	}
	
	// Seed initial data if empty
	var slotCount, rateCount int
	s.db.QueryRow("SELECT COUNT(*) FROM espacios").Scan(&slotCount)
	s.db.QueryRow("SELECT COUNT(*) FROM tarifas").Scan(&rateCount)
	
	if slotCount == 0 || rateCount == 0 {
		s.Seed()
	}
}

func (s *Store) Seed() {
	log.Println("Seeding initial data...")
	
	// Seed Rates
	rates := []Rate{
		{ID: "R-1", VehicleType: Sedan, Unit: Minute, Value: 0.10, Currency: "EUR"},
		{ID: "R-2", VehicleType: SUV, Unit: Minute, Value: 0.15, Currency: "EUR"},
		{ID: "R-3", VehicleType: Motorcycle, Unit: Minute, Value: 0.05, Currency: "EUR"},
		{ID: "R-4", VehicleType: Sedan, Unit: Hour, Value: 5.00, Currency: "EUR"},
		{ID: "R-5", VehicleType: SUV, Unit: Hour, Value: 7.00, Currency: "EUR"},
		{ID: "R-6", VehicleType: Motorcycle, Unit: Hour, Value: 2.50, Currency: "EUR"},
	}
	for _, r := range rates {
		_, err := s.db.Exec("INSERT IGNORE INTO tarifas (id, tipo_vehiculo_id, unit, valor, currency) VALUES (?, ?, ?, ?, ?)", 
			r.ID, r.VehicleType, r.Unit, r.Value, r.Currency)
		if err != nil {
			log.Printf("Error seeding rate %s: %v", r.ID, err)
		}
	}

	// Seed Spaces (Slots)
	// 30 Autos (20 Sedan, 10 SUV)
	for i := 1; i <= 20; i++ {
		id := fmt.Sprintf("A%02d", i)
		s.db.Exec("INSERT IGNORE INTO espacios (id, label, zone, tipo_vehiculo_id) VALUES (?, ?, ?, ?)", id, id, "Auto-A", Sedan)
	}
	for i := 1; i <= 10; i++ {
		id := fmt.Sprintf("B%02d", i)
		s.db.Exec("INSERT IGNORE INTO espacios (id, label, zone, tipo_vehiculo_id) VALUES (?, ?, ?, ?)", id, id, "Auto-B", SUV)
	}
	// 15 Motorcycles
	for i := 1; i <= 15; i++ {
		id := fmt.Sprintf("M%02d", i)
		s.db.Exec("INSERT IGNORE INTO espacios (id, label, zone, tipo_vehiculo_id) VALUES (?, ?, ?, ?)", id, id, "Moto-M", Motorcycle)
	}
	log.Println("Seeding complete.")
}

// --- CRUD Methods for Customers ---

func (s *Store) GetCustomers() []Customer {
	rows, _ := s.db.Query("SELECT id, name, email, phone, plates, plan, notes, created_at FROM customers ORDER BY created_at DESC")
	defer rows.Close()
	var customers []Customer
	for rows.Next() {
		var c Customer
		var platesJSON []byte
		rows.Scan(&c.ID, &c.Name, &c.Email, &c.Phone, &platesJSON, &c.Plan, &c.Notes, &c.CreatedAt)
		json.Unmarshal(platesJSON, &c.Plates)
		customers = append(customers, c)
	}
	return customers
}

func (s *Store) GetCustomer(id string) (Customer, bool) {
	var c Customer
	var platesJSON []byte
	err := s.db.QueryRow("SELECT id, name, email, phone, plates, plan, notes, created_at FROM customers WHERE id = ?", id).
		Scan(&c.ID, &c.Name, &c.Email, &c.Phone, &platesJSON, &c.Plan, &c.Notes, &c.CreatedAt)
	if err != nil {
		return c, false
	}
	json.Unmarshal(platesJSON, &c.Plates)
	return c, true
}

func (s *Store) AddCustomer(c Customer) Customer {
	platesJSON, _ := json.Marshal(c.Plates)
	s.db.Exec("INSERT INTO customers (id, name, email, phone, plates, plan, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
		c.ID, c.Name, c.Email, c.Phone, platesJSON, c.Plan, c.Notes)
	return c
}

func (s *Store) UpdateCustomer(id string, updated Customer) (Customer, bool) {
	platesJSON, _ := json.Marshal(updated.Plates)
	_, err := s.db.Exec("UPDATE customers SET name=?, email=?, phone=?, plates=?, plan=?, notes=? WHERE id=?",
		updated.Name, updated.Email, updated.Phone, platesJSON, updated.Plan, updated.Notes, id)
	return updated, err == nil
}

func (s *Store) DeleteCustomer(id string) bool {
	res, _ := s.db.Exec("DELETE FROM customers WHERE id=?", id)
	count, _ := res.RowsAffected()
	return count > 0
}

func (s *Store) GetSlots() []Slot {
	rows, _ := s.db.Query("SELECT id, label, zone, tipo_vehiculo_id, plate, owner, customer_id, entered_at, rate_snapshot FROM espacios")
	defer rows.Close()
	var slots []Slot
	for rows.Next() {
		var sl Slot
		var pv *ParkedVehicle
		var plate, owner, cid sql.NullString
		var enteredAt sql.NullTime
		var snapshotJSON []byte
		rows.Scan(&sl.ID, &sl.Label, &sl.Zone, &sl.Type, &plate, &owner, &cid, &enteredAt, &snapshotJSON)
		
		if plate.Valid {
			pv = &ParkedVehicle{
				Plate:      plate.String,
				Owner:      owner.String,
				CustomerID: cid.String,
				Type:       sl.Type,
				EnteredAt:  enteredAt.Time,
			}
			json.Unmarshal(snapshotJSON, &pv.RateSnapshot)
			sl.Vehicle = pv
		}
		slots = append(slots, sl)
	}
	return slots
}

func (s *Store) UpdateSlot(id string, slot Slot) bool {
	var plate, owner, cid sql.NullString
	var enteredAt sql.NullTime
	var snapshotJSON []byte

	if slot.Vehicle != nil {
		plate.String, plate.Valid = slot.Vehicle.Plate, true
		owner.String, owner.Valid = slot.Vehicle.Owner, true
		cid.String, cid.Valid = slot.Vehicle.CustomerID, true
		enteredAt.Time, enteredAt.Valid = slot.Vehicle.EnteredAt, true
		snapshotJSON, _ = json.Marshal(slot.Vehicle.RateSnapshot)
	}

	_, err := s.db.Exec("UPDATE espacios SET label=?, zone=?, tipo_vehiculo_id=?, plate=?, owner=?, customer_id=?, entered_at=?, rate_snapshot=? WHERE id=?",
		slot.Label, slot.Zone, slot.Type, plate, owner, cid, enteredAt, snapshotJSON, id)
	return err == nil
}

func (s *Store) AddSlot(sl Slot) Slot {
	s.db.Exec("INSERT INTO espacios (id, label, zone, tipo_vehiculo_id) VALUES (?, ?, ?, ?)",
		sl.ID, sl.Label, sl.Zone, sl.Type)
	return sl
}

func (s *Store) DeleteSlot(id string) bool {
	res, _ := s.db.Exec("DELETE FROM espacios WHERE id=?", id)
	count, _ := res.RowsAffected()
	return count > 0
}

func (s *Store) GetMovements() []Movement {
	rows, _ := s.db.Query("SELECT id, placa, tipo_vehiculo_id, espacio_id, fecha_hora_entrada, fecha_hora_salida, amount, currency, estado, rate_snapshot FROM registros ORDER BY fecha_hora_entrada DESC")
	defer rows.Close()
	var movements []Movement
	for rows.Next() {
		var m Movement
		var checkOut sql.NullTime
		var snapshotJSON []byte
		rows.Scan(&m.ID, &m.Plate, &m.Type, &m.SlotID, &m.CheckIn, &checkOut, &m.Amount, &m.Currency, &m.Status, &snapshotJSON)
		if checkOut.Valid {
			m.CheckOut = &checkOut.Time
		}
		json.Unmarshal(snapshotJSON, &m.RateSnapshot)
		movements = append(movements, m)
	}
	return movements
}

func (s *Store) AddMovement(m Movement) Movement {
	snapshotJSON, _ := json.Marshal(m.RateSnapshot)
	s.db.Exec("INSERT INTO registros (id, placa, tipo_vehiculo_id, espacio_id, fecha_hora_entrada, currency, estado, rate_snapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		m.ID, m.Plate, m.Type, m.SlotID, m.CheckIn, m.Currency, m.Status, snapshotJSON)
	return m
}

func (s *Store) UpdateMovement(id string, updated Movement) bool {
	snapshotJSON, _ := json.Marshal(updated.RateSnapshot)
	var checkOut sql.NullTime
	if updated.CheckOut != nil {
		checkOut.Time, checkOut.Valid = *updated.CheckOut, true
	}
	_, err := s.db.Exec("UPDATE registros SET fecha_hora_salida=?, amount=?, currency=?, estado=?, rate_snapshot=? WHERE id=?",
		checkOut, updated.Amount, updated.Currency, updated.Status, snapshotJSON, id)
	return err == nil
}

func (s *Store) GetRates() []Rate {
	rows, _ := s.db.Query("SELECT id, tipo_vehiculo_id, unit, valor, fraction_min, currency FROM tarifas WHERE activo = 1")
	defer rows.Close()
	var rates []Rate
	for rows.Next() {
		var r Rate
		rows.Scan(&r.ID, &r.VehicleType, &r.Unit, &r.Value, &r.FractionMin, &r.Currency)
		rates = append(rates, r)
	}
	return rates
}

func (s *Store) GetActiveRate(vType VehicleType) (Rate, bool) {
	var r Rate
	err := s.db.QueryRow("SELECT id, tipo_vehiculo_id, unit, valor, fraction_min, currency FROM tarifas WHERE tipo_vehiculo_id = ? AND activo = 1 LIMIT 1", vType).
		Scan(&r.ID, &r.VehicleType, &r.Unit, &r.Value, &r.FractionMin, &r.Currency)
	return r, err == nil
}

func (s *Store) AddRate(r Rate) Rate {
	s.db.Exec("INSERT INTO tarifas (id, tipo_vehiculo_id, unit, valor, fraction_min, currency) VALUES (?, ?, ?, ?, ?, ?)",
		r.ID, r.VehicleType, r.Unit, r.Value, r.FractionMin, r.Currency)
	return r
}

func (s *Store) UpdateRate(id string, updated Rate) bool {
	_, err := s.db.Exec("UPDATE tarifas SET tipo_vehiculo_id=?, unit=?, valor=?, fraction_min=?, currency=? WHERE id=?",
		updated.VehicleType, updated.Unit, updated.Value, updated.FractionMin, updated.Currency, id)
	return err == nil
}

func (s *Store) DeleteRate(id string) bool {
	_, err := s.db.Exec("UPDATE tarifas SET activo = 0 WHERE id=?", id)
	return err == nil
}
