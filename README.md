# login-crypto

# Copiar el archivo de ejemplo de variables de entorno
```bash
cp .env.example .env
```

# Ejecución con Docker Compose
```bash
# Desde la raíz del monorepo
docker compose up --build

# Servicios disponibles:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:8080
#   Postgres:  localhost:5432  (logindb / loginuser / loginpass)

# Login inicial del administrador:
#   usuario: admin   contraseña: Admin12345

# Detener y limpiar:
docker compose down          # conserva los datos
docker compose down -v       # borra también el volumen de la BD
```

# Ejecutar pruebas e2e con newman
```bash
# (Opcional si no está instalado) Instalar newman globalmente
npm install -g newman
# Desde la raíz del monorepo
newman run ./tests/login-crypto.postman_collection.json
```