package main

import (
	"AuthMicroservice/internal/config"
	"AuthMicroservice/internal/server"
	"encoding/json"
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	jwt "github.com/golang-jwt/jwt/v5"
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

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

type User struct {
	Id       string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type fakeUserRepo struct {
	mu    sync.Mutex
	users map[string]*User // Ключ - email
}

type JWTManager struct {
	secret    []byte
	accessTTL time.Duration
}

var ErrEmailTaken = errors.New("email already registered")

func newFakeUserRepo() *fakeUserRepo {
	repo := &fakeUserRepo{users: make(map[string]*User)}

	seedhash, _ := bcrypt.GenerateFromPassword([]byte("qwe"), bcrypt.DefaultCost)
	repo.users["user123@gmail.com"] = &User{
		Id:       "1",
		Email:    "user123@gmail.com",
		Password: string(seedhash),
	}
	return repo
}

func (r *fakeUserRepo) GetByEmail(email string) (*User, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	u, ok := r.users[email]

	return u, ok
}

func (r *fakeUserRepo) CreateNewUser(email, passwordHash string) (*User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exist := r.users[email]; exist {
		return nil, ErrEmailTaken
	}

	id := fmt.Sprintf("%d", len(r.users)+1)
	u := &User{Id: id, Email: email, Password: passwordHash}
	r.users[email] = u

	return u, nil
}

func NewJWTManager(secret string, accessTTL time.Duration) *JWTManager {
	return &JWTManager{secret: []byte(secret), accessTTL: accessTTL}
}

// Метод дял создания Access-токена, который взаимодействует с JWTManager
func (m *JWTManager) GenerateAccessToken(userID, email string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,

		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.accessTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "auth-service",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

// Метод для распознования + проверки токена
func (m *JWTManager) ParseAndValidate(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return m.secret, nil
	})
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token: %w", err)
	}
	return claims, nil
}

// Метод получения пользователя по почте (до появления БД)
//func (r *fakeUserRepo) GetByEmail(email string) (*User, bool) {
//	if email == "user123@gmail.com" {
//		return &User{Id: "1", Email: "user123@gmail.com", Password: "qwe"}, true
//	}
//	return nil, false
//}

var repo = newFakeUserRepo()
var jwtManager *JWTManager

func main() {

	// Инстанс конфига (загрузили его)
	cfg := config.Load()

	fmt.Println(cfg.JWT_SECRET)
	//Инстанс JWT-менеджера
	jwtManager = NewJWTManager(cfg.JWT_SECRET, 15*time.Minute)

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
		r.Get("/allUsers", allUsersHandler)
		// Метод Nginx для валидации токена
		r.Handle("/validate", http.HandlerFunc(validateHandler))
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
	var req LoginData
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	user, ok := repo.GetByEmail(req.Email)
	// Сравнение хэшей пароля из запроса и пароля в базе (в памяти)
	if !ok || bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)) != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	token, err := jwtManager.GenerateAccessToken(user.Id, user.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"access_token": token})
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginData

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "email and password are required", http.StatusBadRequest)
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	user, err := repo.CreateNewUser(req.Email, string(passwordHash))
	if err != nil {
		if errors.Is(err, ErrEmailTaken) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"error": "email already registered"})

			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	token, err := jwtManager.GenerateAccessToken(user.Id, user.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"access_token": token})
}

func validateHandler(w http.ResponseWriter, r *http.Request) {
	token := extractBearerToken(r.Header.Get("Authorization"))
	if token == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	claims, err := jwtManager.ParseAndValidate(token)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	w.Header().Set("X-User-Id", claims.UserID)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("access_token is valid")
}

func allUsersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(repo.users)
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
}

func extractBearerToken(authToken string) string {
	if (len(authToken) > 7) && (authToken[:7] == "Bearer ") {
		return authToken[7:]
	}
	return ""
}

//func parseAndVerifyJWT(tokenString string, secret string)
