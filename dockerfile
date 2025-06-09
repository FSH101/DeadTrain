# Используем официальный образ PHP с Apache
FROM php:7.4-apache

# Включаем модуль mod_rewrite, если понадобится позже
RUN a2enmod rewrite

# Копируем все файлы проекта в директорию, обслуживаемую Apache
COPY . /var/www/html/

# Делаем папку userdata доступной для записи
RUN chmod -R 777 /var/www/html/userdata

# Открываем порт 80
EXPOSE 80

# Запускаем Apache в фоне
CMD ["apache2-foreground"]