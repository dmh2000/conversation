package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/dmh2000/ai-server/config"
	"github.com/dmh2000/ai-server/internal/ai"
	"github.com/dmh2000/ai-server/internal/logger"
	"github.com/dmh2000/ai-server/internal/server"
	"github.com/dmh2000/ai-server/internal/types"
)

func main() {
	logger.Println("Starting AI Server...")

	// Load configuration
	cfg := config.Load()
	logger.Printf("Configuration: Alice port=%d, Bob port=%d", cfg.AlicePort, cfg.BobPort)

	// Create context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Create channels for communication
	// BobServer <-> BobAI
	bobServerToAI := make(chan string, cfg.ChannelBuffer)
	bobAIToServer := make(chan types.ConversationMessage, cfg.ChannelBuffer)

	// AliceServer <-> AliceAI
	aliceServerToAI := make(chan string, cfg.ChannelBuffer)
	aliceAIToServer := make(chan types.ConversationMessage, cfg.ChannelBuffer)

	// BobAI -> AliceAI
	bobToAlice := make(chan types.ConversationMessage, cfg.ChannelBuffer)

	// AliceAI -> BobAI (for context)
	aliceToBob := make(chan types.ConversationMessage, cfg.ChannelBuffer)

	// Create server instances
	aliceServer := server.NewAliceServer(cfg.AlicePort, aliceServerToAI, aliceAIToServer)
	bobServer := server.NewBobServer(cfg.BobPort, bobServerToAI, bobAIToServer)

	// Create AI instances
	aliceAI := ai.NewAliceAI(aliceServerToAI, aliceAIToServer, bobToAlice, aliceToBob)
	bobAI := ai.NewBobAI(bobServerToAI, bobAIToServer, bobToAlice, aliceToBob)

	// Set up reset callbacks - both servers reset both AIs
	resetBothAIs := func() {
		aliceAI.Reset()
		bobAI.Reset()
		logger.Println("Both AI contexts have been reset")
	}
	aliceServer.SetResetCallback(resetBothAIs)
	bobServer.SetResetCallback(resetBothAIs)

	// When Bob starts a new conversation, resume Alice
	bobAI.SetStartNewConvCallback(func() {
		aliceAI.Resume()
		logger.Println("Alice AI resumed for new conversation")
	})

	// Start AI components
	go aliceAI.Start(ctx)
	go bobAI.Start(ctx)

	// Start servers in goroutines
	go func() {
		if err := aliceServer.Start(ctx); err != nil {
			logger.Printf("Alice server error: %v", err)
		}
	}()

	go func() {
		if err := bobServer.Start(ctx); err != nil {
			logger.Printf("Bob server error: %v", err)
		}
	}()

	logger.Println("AI Server is running. Press Ctrl+C to stop.")

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan

	logger.Println("Shutting down AI Server...")
	cancel()

	// Give goroutines time to clean up
	// In a production app, you'd use a WaitGroup here
	logger.Println("AI Server stopped")
}
