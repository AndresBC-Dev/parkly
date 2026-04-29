# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Declarar los argumentos para que Railway pase las variables de entorno al build
ARG VITE_API_URL

# Convertir el ARG en ENV para que Vite lo detecte durante 'npm run build'
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application - Aquí es donde se inyecta la URL de parkly
RUN npm run build

# Final stage
FROM nginx:alpine

# Copy build files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Add nginx config for SPA routing (evita el 404 al recargar rutas)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]