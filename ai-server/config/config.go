package config

import (
	"os"
	"strconv"
)

// Config holds application configuration
type Config struct {
	AlicePort    int
	BobPort      int
	ChannelBuffer int
}

// Load returns a new Config with values from environment or defaults
func Load() *Config {
	return &Config{
		AlicePort:    getEnvInt("ALICE_PORT", 3001),
		BobPort:      getEnvInt("BOB_PORT", 3002),
		ChannelBuffer: getEnvInt("CHANNEL_BUFFER", 10),
	}
}

// getEnv returns the value of an environment variable or a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvInt returns the integer value of an environment variable or a default value
func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
