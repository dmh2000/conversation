# Code Review Report: AI Server

**Date:** 2026-01-01
**Scope:** ai-server/ Go codebase
**Reviewer:** my-code-review plugin

---

## Summary

- **Files reviewed:** 4
- **Issues found:** 15 (2 critical, 8 warnings, 5 suggestions)
- **Overall quality:** Acceptable - Good architecture, some improvements needed

---

## Critical Issues

### `aliceai.go:167-175` - Thread-unsafe lazy initialization

**Problem:** The LLM client is lazily initialized without mutex protection. If `createResponseMessage` is called concurrently, multiple clients could be created.

```go
if a.client == nil {  // Thread-unsafe check
    client, err := llmclient.NewClient("gemini")
    ...
    a.client = client
}
```

**Suggestion:** Use `sync.Once` for thread-safe lazy initialization:

```go
var clientOnce sync.Once
clientOnce.Do(func() {
    a.client, _ = llmclient.NewClient("gemini")
})
```

### `bobai.go:190-198` - Same thread-unsafe pattern

**Problem:** Identical issue in BobAI's `createQuestionToAlice` method.

---

## Warnings

### `aliceai.go:150` - Typo in function name

**Problem:** `validateResonse` should be `validateResponse`

```go
func validateResonse(response string) string {  // Typo
```

### `bobai.go:183` - Typo in error message

**Problem:** "Opps" should be "Oops"

```go
return "<bob>Opps I lost my train of thought. Where was I?</bob>"
```

### `aliceai.go:16` - Naming convention violation

**Problem:** `llm_model` uses snake_case instead of Go's camelCase

```go
const llm_model = "gemini-2.5-pro"  // Should be llmModel
```

### `aliceai.go:179,183` - More naming violations

**Problem:** Variables use snake_case

```go
bob_says := msg.Text      // Should be bobSays
alice_says, err := ...    // Should be aliceSays
```

### `aliceai.go:156`, `bobai.go:179` - Fragile error checking

**Problem:** Checking error message strings is brittle

```go
if err.Error() == "unexpected EOF" {  // Fragile
```

**Suggestion:** Use `errors.Is()` or check for specific error types

### `aliceai.go:170,185` and `bobai.go:194,207` - Inconsistent logging

**Problem:** Using `fmt.Println` for errors instead of the logger

```go
fmt.Println(err)  // Should use logger.Printf
```

### `aliceai.go:205-215` - Duplicate/dead code

**Problem:** Creates and sends `uiMsg` to `toAliceUI`, but the same message was already sent at lines 125-131. This sends duplicate messages.

### `main.go:92-94` - Missing proper graceful shutdown

**Problem:** Comment acknowledges WaitGroup should be used but isn't implemented

```go
// In a production app, you'd use a WaitGroup here
```

---

## Suggestions

### Code Duplication - `validateQuestion` / `validateResonse`

**Improvement:** These functions are nearly identical. Consider a generic validator:

```go
func validateXMLResponse(response, tag, fallback string) string {
    // Generic validation logic
}
```

### Code Duplication - XML trimming

**Improvement:** The pattern `strings.TrimPrefix/TrimSuffix` for XML tags appears 4 times. Extract to helper:

```go
func stripXMLTags(text, tag string) string {
    text = strings.TrimPrefix(text, "<"+tag+">")
    return strings.TrimSuffix(text, "</"+tag+">")
}
```

### `bobserver.go` - Consider connection limits

**Improvement:** Server replaces connections without limit. Consider rate limiting or max connection checks for production.

### Error handling in channel sends

**Improvement:** Dropped messages are logged but could be monitored/metered:

```go
default:
    logger.Println("AI channel full, dropping message")
    // Consider: metrics.IncrementDroppedMessages()
```

### Client initialization - Consider dependency injection

**Improvement:** Instead of lazy initialization, inject the client via constructor for better testability.

---

## File-by-File Summary

| File | Critical | Warnings | Suggestions | Quality |
|------|----------|----------|-------------|---------|
| `aliceai.go` | 1 | 5 | 2 | Needs Work |
| `bobai.go` | 1 | 2 | 1 | Acceptable |
| `bobserver.go` | 0 | 0 | 1 | Good |
| `main.go` | 0 | 1 | 1 | Good |

---

## Recommended Actions

1. **Fix thread-safety** - Use `sync.Once` for client initialization (Critical)
2. **Fix typos** - `validateResonse` → `validateResponse`, "Opps" → "Oops"
3. **Fix naming** - Convert snake_case to camelCase (`llm_model` → `llmModel`)
4. **Remove duplicate send** - `aliceai.go:205-215` sends duplicate UI message
5. **Use logger consistently** - Replace `fmt.Println` with `logger.Printf`
6. **Consider refactoring** - Extract duplicate XML validation/trimming logic

---

## Positive Aspects

- Clean channel-based architecture for concurrent message passing
- Good use of mutexes for connection management in servers
- Proper context propagation for graceful shutdown
- Embedded system prompts via `//go:embed`
- Clear separation of concerns (server, AI, config, types)
