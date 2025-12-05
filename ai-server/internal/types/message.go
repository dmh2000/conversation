package types

// ConversationMessage represents a message exchanged via WebSocket
type ConversationMessage struct {
	Type string `json:"type,omitempty"`
	Text string `json:"text,omitempty"`
}

// Message types
const (
	MessageTypeReset    = "reset"
	MessageTypeResetAck = "reset_ack"
)
