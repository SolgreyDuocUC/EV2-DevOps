# Empresa de Despachos - Proyecto Semestral

Este proyecto es un sistema de gestión de ventas y despachos basado en una arquitectura de microservicios, con un frontend en React y bases de datos MySQL, todo completamente contenedorizado.

## Arquitectura del Proyecto

El sistema se divide en los siguientes componentes:

- **Frontend**: Aplicación SPA desarrollada con React, Vite y TailwindCSS.
- **Microservicio Ventas (ms-ventas)**: Servicio basado en Spring Boot que gestiona las órdenes de compra.
- **Microservicio Despachos (ms-despachos)**: Servicio basado en Spring Boot que gestiona la logística de envíos.
- **Bases de Datos**: Dos instancias independientes de MySQL para asegurar la independencia de datos por microservicio.

## Despliegue con Docker

El proyecto utiliza Docker y Docker Compose para facilitar el despliegue.

### Requisitos
- Docker Desktop / Docker Engine
- Docker Compose

### Pasos para levantar el sistema
1. Clona el repositorio.
2. Asegúrate de tener configurado el archivo `.env` (puedes usar `.env.template` como base).
3. Desde la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up --build -d
   ```

### Puertos configurados por defecto
- **Frontend**: http://localhost
- **Ventas API**: http://localhost:8080
- **Despachos API**: http://localhost:8081

## Variables de Entorno
El sistema utiliza un archivo `.env` centralizado para configurar:
- Contraseñas de bases de datos.
- Nombres de esquemas.
- Mapeo de puertos para el host.

## Integración Continua (GitHub Actions)

El proyecto está preparado para usar GitHub Actions. Se ha incluido un flujo de trabajo básico que:
1. Compila los microservicios con Maven.
2. Construye las imágenes Docker.
3. Verifica que la estructura del proyecto sea correcta.

Para usarlo, sube el código a GitHub y revisa la pestaña **Actions**.

---

> [!IMPORTANT]
> Las instrucciones detalladas de cada módulo se encuentran en los archivos `instrucciones.txt` dentro de sus respectivas carpetas.
