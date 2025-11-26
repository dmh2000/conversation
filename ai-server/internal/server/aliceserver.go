package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/dmh2000/ai-server/internal/types"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for development
		return true
	},
}

// AliceServer manages WebSocket connections for Alice client
type AliceServer struct {
	port          int
	currentConn   *websocket.Conn
	connMutex     sync.Mutex
	toAI          chan<- string
	fromAI        <-chan types.ConversationMessage
}

// NewAliceServer creates a new Alice WebSocket server
func NewAliceServer(port int, toAI chan<- string, fromAI <-chan types.ConversationMessage) *AliceServer {
	return &AliceServer{
		port:   port,
		toAI:   toAI,
		fromAI: fromAI,
	}
}

// Start begins listening for WebSocket connections and handling messages
func (s *AliceServer) Start(ctx context.Context) error {
	// Start goroutine to listen for messages from AI and broadcast to client
	go s.broadcastFromAI(ctx)

	// Set up HTTP server for WebSocket
	http.HandleFunc("/", s.handleWebSocket)

	addr := fmt.Sprintf("localhost:%d", s.port)
	log.Printf("Alice server listening on %s", addr)

	server := &http.Server{Addr: addr}

	// Handle graceful shutdown
	go func() {
		<-ctx.Done()
		log.Println("Shutting down Alice server...")
		server.Close()
	}()

	return server.ListenAndServe()
}

// handleWebSocket handles incoming WebSocket connections
func (s *AliceServer) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Check if we already have a connection
	s.connMutex.Lock()
	if s.currentConn != nil {
		s.connMutex.Unlock()
		http.Error(w, "Connection already exists", http.StatusServiceUnavailable)
		return
	}
	s.connMutex.Unlock()

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Set current connection
	s.connMutex.Lock()
	s.currentConn = conn
	s.connMutex.Unlock()

	log.Println("Alice client connected")

	// Handle connection closure
	defer func() {
		s.connMutex.Lock()
		s.currentConn = nil
		s.connMutex.Unlock()
		conn.Close()
		log.Println("Alice client disconnected")
	}()

	// Read messages from client (Alice mostly receives, but may send)
	for {
		var msg types.ConversationMessage
		err := conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Forward text to AI if present
		if msg.Text != "" {
			log.Printf("Alice client sent: %s", msg.Text)
			select {
			case s.toAI <- msg.Text:
			default:
				log.Println("AI channel full, dropping message")
			}
		}
	}
}

// broadcastFromAI listens for messages from AI and sends to connected client
func (s *AliceServer) broadcastFromAI(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-s.fromAI:
			s.connMutex.Lock()
			conn := s.currentConn
			s.connMutex.Unlock()

			if conn != nil {
				log.Printf("Broadcasting to Alice client: %s", msg.Text)
				if err := conn.WriteJSON(msg); err != nil {
					log.Printf("Failed to send message to Alice client: %v", err)
				}
			} else {
				log.Println("No Alice client connected, message dropped")
			}
		}
	}
}
