# Этап сборки фронтенда
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Этап доставки собранного бандла
FROM php:7.4-apache

RUN a2enmod rewrite

COPY --from=build /app/dist/ /var/www/html/

RUN mkdir -p /var/www/html/userdata && chmod -R 777 /var/www/html/userdata

EXPOSE 80

CMD ["apache2-foreground"]