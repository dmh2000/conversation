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

// BobServer manages WebSocket connections for Bob client
type BobServer struct {
	port        int
	currentConn *websocket.Conn
	connMutex   sync.Mutex
	writeMutex  sync.Mutex
	toAI        chan<- string
	fromAI      <-chan types.ConversationMessage
}

// NewBobServer creates a new Bob WebSocket server
func NewBobServer(port int, toAI chan<- string, fromAI <-chan types.ConversationMessage) *BobServer {
	return &BobServer{
		port:   port,
		toAI:   toAI,
		fromAI: fromAI,
	}
}

// Start begins listening for WebSocket connections and handling messages
func (s *BobServer) Start(ctx context.Context) error {
	// Start goroutine to listen for messages from AI and broadcast to client
	go s.broadcastFromAI(ctx)

	// Set up HTTP server for WebSocket
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleWebSocket)

	addr := fmt.Sprintf("localhost:%d", s.port)
	logger.Printf("Bob server listening on %s", addr)

	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	// Handle graceful shutdown
	go func() {
		<-ctx.Done()
		logger.Println("Shutting down Bob server...")
		server.Close()
	}()

	return server.ListenAndServe()
}

// handleWebSocket handles incoming WebSocket connections
func (s *BobServer) handleWebSocket(w http.ResponseWriter, r *http.Request) {
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

	logger.Println("Bob client connected")

	// Handle connection closure
	defer func() {
		s.connMutex.Lock()
		// Only clear currentConn if it's still us (hasn't been replaced)
		if s.currentConn == conn {
			s.currentConn = nil
		}
		s.connMutex.Unlock()
		conn.Close()
		logger.Println("Bob client disconnected")
	}()

	// Read messages from client
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
			// Send the message back to the client
			s.writeMutex.Lock()
			if err := conn.WriteJSON(msg); err != nil {
				logger.Printf("Failed to send response to Bob client: %v", err)
			}
			s.writeMutex.Unlock()

			logger.Printf("Bob client sent: %s", msg.Text)
			select {
			case s.toAI <- msg.Text:
			default:
				logger.Println("AI channel full, dropping message")
			}
		}
	}
}

// broadcastFromAI listens for messages from AI and sends to connected client
func (s *BobServer) broadcastFromAI(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-s.fromAI:
			s.connMutex.Lock()
			conn := s.currentConn
			s.connMutex.Unlock()

			logger.Printf("%v", msg)
			if conn != nil {
				logger.Printf("Broadcasting to Bob client: %s", msg.Text)
				s.writeMutex.Lock()
				if err := conn.WriteJSON(msg); err != nil {
					logger.Printf("Failed to send message to Bob client: %v", err)
				}
				s.writeMutex.Unlock()
			} else {
				logger.Println("No Bob client connected, message dropped")
			}
		}
	}
}
