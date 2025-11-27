package logger

import (
	"fmt"
	"log"
	"path/filepath"
	"runtime"
	"strings"
)

// projectRoot is detected at init time
var projectRoot string

func init() {
	// Get the path to this file to determine project root
	_, file, _, ok := runtime.Caller(0)
	if ok {
		// This file is at internal/logger/logger.go
		// Go up 3 levels to get project root
		projectRoot = filepath.Dir(filepath.Dir(filepath.Dir(file)))
	}
}

// getCallerInfo returns the relative file path and line number of the caller
func getCallerInfo(skip int) string {
	_, file, line, ok := runtime.Caller(skip)
	if !ok {
		return "???:0"
	}

	// Make path relative to project root
	if projectRoot != "" && strings.HasPrefix(file, projectRoot) {
		file = strings.TrimPrefix(file, projectRoot)
		file = strings.TrimPrefix(file, string(filepath.Separator))
	}

	return fmt.Sprintf("%s:%d", file, line)
}

// Printf logs a formatted message with file:line prefix
func Printf(format string, v ...interface{}) {
	caller := getCallerInfo(2)
	msg := fmt.Sprintf(format, v...)
	log.Printf("[%s] %s", caller, msg)
}

// Println logs a message with file:line prefix
func Println(v ...interface{}) {
	caller := getCallerInfo(2)
	msg := fmt.Sprint(v...)
	log.Printf("[%s] %s", caller, msg)
}
