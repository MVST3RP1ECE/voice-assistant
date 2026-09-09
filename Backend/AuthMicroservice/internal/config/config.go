package config

import (
	_ "github.com/joho/godotenv/autoload"
	"os"
	"strings"
)

type Config struct {
	Port           string
	AllowedOrigins []string
}

// Load читает конфиг из env
func Load() Config {
	origins := os.Getenv("API_ALLOWED_ORIGINS")

	if origins == "" {
		origins = "http://localhost:5173"
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	return Config{
		Port:           port,
		AllowedOrigins: strings.Split(origins, ","),
	}
}
