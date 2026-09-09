package main

import (
	"AuthMicroservice/internal/config"
	"AuthMicroservice/internal/server"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"log"
	"net/http"
)

type ResponseData struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	//Items   []string `json:"items"`
}

type LoginData struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func main() {

	// Инстанс конфига (загрузили его)
	cfg := config.Load()

	// Инстанс роутера для роутинга
	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	// CORS должен быть подключён первым и до роутов
	// middleware - иначе preflight запрос может не долететь
	// до обработчика и браузер получит ошибку CORS вместо реального ответа
	r.Use(server.NewCORSMiddleware(cfg.AllowedOrigins))

	//	Управление роутами
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/login", loginHandler)
		r.Post("/register", registerHandler)
		r.Post("/refresh", refreshHandler)
		r.Post("/logout", logoutHandler)
		r.Get("/me", meHandler)
	})

	r.Route("/api/v1/ping", func(r chi.Router) {
		r.Get("/", pingHandler)
	})

	// Запуск сервера + обработка ошибки
	log.Printf("AuthService listening on :%s (AllowedOrigins: %v)", cfg.Port, cfg.AllowedOrigins)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal(err)
	}

}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Закрываем тело запроса в конце работы функции
	defer r.Body.Close()

	var req LoginData
	// 2. Декодируем JSON прямо из r.Body
	err := json.NewDecoder(r.Body).Decode(&req)
	
	if err != nil {
		http.Error(w, "Некорректный JSON в запросе", http.StatusBadRequest)
		return
	}

	data := LoginData{
		Email:    "Email: " + req.Email,
		Password: "Password: " + req.Password,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("registerHandler"))
}

func refreshHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("refreshHandler"))
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("logoutHandler"))
}

func meHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("meHandler"))
}

func pingHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	//data := ResponseData{
	//	Status:  "Success",
	//	Message: "Pong. Без потоков данных",
	//}
	data := "Pong. Без потоков"
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
	//w.Write([]byte("pong"))
}
