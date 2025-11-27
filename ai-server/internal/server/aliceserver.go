package server

import (
	"context"
	"fmt"
	"net/http"
	"sync"

	"github.com/dmh2000/ai-server/internal/logger"
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
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleWebSocket)

	addr := fmt.Sprintf("localhost:%d", s.port)
	logger.Printf("Alice server listening on %s", addr)

	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	// Handle graceful shutdown
	go func() {
		<-ctx.Done()
		logger.Println("Shutting down Alice server...")
		server.Close()
	}()

	return server.ListenAndServe()
}

// handleWebSocket handles incoming WebSocket connections
func (s *AliceServer) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Check if we already have a connection and replace it if so
	s.connMutex.Lock()
	var oldConn *websocket.Conn
	if s.currentConn != nil {
		oldConn = s.currentConn
		logger.Println("Replacing existing connection")
	}
	s.currentConn = conn
	s.connMutex.Unlock()

	// Close the old connection if it existed
	if oldConn != nil {
		oldConn.Close()
	}

	logger.Println("Alice client connected")

	// Handle connection closure
	defer func() {
		s.connMutex.Lock()
		// Only clear currentConn if it's still us (hasn't been replaced)
		if s.currentConn == conn {
			s.currentConn = nil
		}
		s.connMutex.Unlock()
		conn.Close()
		logger.Println("Alice client disconnected")
	}()

	// Read messages from client (Alice mostly receives, but may send)
	for {
		var msg types.ConversationMessage
		err := conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Forward text to AI if present
		if msg.Text != "" {
			logger.Printf("Alice client sent: %s", msg.Text)
			select {
			case s.toAI <- msg.Text:
			default:
				logger.Println("AI channel full, dropping message")
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
				logger.Printf("Broadcasting to Alice client: %s", msg.Text)
				if err := conn.WriteJSON(msg); err != nil {
					logger.Printf("Failed to send message to Alice client: %v", err)
				}
			} else {
				logger.Println("No Alice client connected, message dropped")
			}
		}
	}
}
