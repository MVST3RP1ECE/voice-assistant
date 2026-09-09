FROM golang:1.25.8-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Принудительно компилируем прямо в корень рабочей директории под именем app_bin
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/app_bin ./cmd/api

# Используем образ покрупнее, чтобы контейнер точно запустился для отладки
FROM alpine:3.20

WORKDIR /root

# Копируем файл
COPY --from=builder /app/app_bin .

# Временно меняем команду запуска, чтобы контейнер не падал,
# а просто вывел список файлов и показал, где лежит наш бинарник
CMD ["./app_bin"]
