package server

import (
	"github.com/go-chi/cors"
	"net/http"
)

// NewCORSMiddleware настроен под auth-flow
// - AllowCredentials: true, иначе браузер не отправит httpOnly refresh-cookie
// - AllowedOrigins - ТОЛЬКО явный список, без "*". Т.к. комбинация "* + credentials: true запрещена спецификацией CORS
// Браузер такой запрос отбросит и запрос упадёт с ошибкой
// - AllowedHeaders включает Authorization, т.к. access-token летит в этом заголовке

func NewCORSMiddleware(allowedOrigins []string) func(handler http.Handler) http.Handler {
	return cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "Authorization"},
		AllowCredentials: true,
		// MaxAge кэширует ответ на preflight OPTIONS-запрос.
		// Чтобы избежать лишних запросов.
		MaxAge: 300,
	})
}
