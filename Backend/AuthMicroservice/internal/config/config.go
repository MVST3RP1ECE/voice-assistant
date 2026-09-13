package config

import (
	"os"
	"strings"

	_ "github.com/joho/godotenv/autoload"
)

type Config struct {
	Port           string
	AllowedOrigins []string
	JWT_SECRET     string
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

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		panic("JWT_SECRET is not set in environment variables")
	}

	return Config{
		Port:           port,
		AllowedOrigins: strings.Split(origins, ","),
		JWT_SECRET:     jwtSecret,
	}
}
