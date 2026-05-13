# Guía de GitHub Actions para Principiantes

GitHub Actions es una herramienta que te permite automatizar tareas (como compilar, probar y desplegar tu código) directamente desde tu repositorio de GitHub. A esto se le llama **CI/CD** (Integración Continua y Despliegue Continuo).

## 1. Configuración de Secretos (GitHub Secrets) 

Para que GitHub pueda conectarse a DockerHub y AWS sin exponer tus contraseñas, debes guardar tus credenciales como **Secrets**.

1. Ve a tu repositorio en GitHub.
2. Haz clic en **Settings** > **Secrets and variables** > **Actions**.
3. Haz clic en **New repository secret** y agrega cada uno de los siguientes:

| Nombre del Secreto | Descripción |
| :--- | :--- |
| `DOCKERHUB_USERNAME` | Tu nombre de usuario en Docker Hub. |
| `DOCKERHUB_TOKEN` | Un Access Token creado en Docker Hub (no uses tu contraseña real). |
| `AWS_ACCESS_KEY_ID` | Tu Access Key de IAM en AWS. |
| `AWS_SECRET_ACCESS_KEY` | Tu Secret Access Key de IAM en AWS. |
| `AWS_REGION` | Ejemplo: `us-east-1`. |
| `EC2_PUBLIC_IP` | La IP pública de tu instancia EC2. |
| `EC2_PRIVATE_KEY` | El contenido completo de tu archivo `.pem` (clave privada). |
| `EC2_PRIVATE_INSTANCE_ID`| El ID de tu instancia (ej: `i-0abc123def456`). |
| `S3_TEMP_BUCKET` | El nombre del bucket S3 para transferir archivos. |
| `DB_USER` | Usuario para la base de datos (ej: `root`). |
| `DB_PASS` | Contraseña para la base de datos. |

---

## 2. El Pipeline (Workflow) 

Crea un archivo en la ruta `.github/workflows/deploy.yml` y pega el siguiente código. Este código explica cada paso para que lo entiendas fácilmente.

```yaml
name: Pipeline de Despliegue (Docker + AWS)

on:
  push:
    branches: [ "main" ] # Se ejecuta cada vez que subes algo a la rama main

jobs:
  # PASO 1: Construir y Subir Imágenes a DockerHub
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del código
        uses: actions/checkout@v4

      - name: Login en DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Construir y Subir imágenes
        run: |
          # Construimos las imágenes usando docker compose
          docker compose build
          
          # Etiquetamos y subimos (asumiendo nombres de imagen estándar en tu compose)
          # Ajusta los nombres 'backend' y 'frontend' según tu docker-compose.yml
          docker tag ms-ventas ${{ secrets.DOCKERHUB_USERNAME }}/ms-ventas:latest
          docker tag ms-despachos ${{ secrets.DOCKERHUB_USERNAME }}/ms-despachos:latest
          docker tag frontend ${{ secrets.DOCKERHUB_USERNAME }}/frontend:latest
          
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/ms-ventas:latest
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/ms-despachos:latest
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/frontend:latest

  # PASO 2: Preparar archivos en AWS S3
  prepare-files:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configurar AWS CLI
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Subir docker-compose a S3
        run: |
          aws s3 cp docker-compose.yml s3://${{ secrets.S3_TEMP_BUCKET }}/deploy/docker-compose.yml

  # PASO 3: Desplegar en EC2 vía SSH
  deploy-to-ec2:
    needs: prepare-files
    runs-on: ubuntu-latest
    steps:
      - name: Ejecutar comandos en EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_PUBLIC_IP }}
          username: ubuntu # Ajusta si usas Amazon Linux (ec2-user)
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          script: |
            # 1. Configurar AWS CLI en el servidor (si no está)
            # 2. Descargar el archivo compose desde S3
            aws s3 cp s3://${{ secrets.S3_TEMP_BUCKET }}/deploy/docker-compose.yml ./docker-compose.yml
            
            # 3. Descargar las nuevas versiones de las imágenes
            docker compose pull
            
            # 4. Reiniciar los contenedores
            export DB_USER=${{ secrets.DB_USER }}
            export DB_PASS=${{ secrets.DB_PASS }}
            docker compose up -d
```

---

## 3. ¿Qué hace este pipeline? (Explicación para Principiantes)

1.  **Checkout**: GitHub Actions "descarga" tu código en un servidor temporal de GitHub para poder trabajar con él.
2.  **Login en DockerHub**: Se identifica con tu usuario y token para tener permiso de subir imágenes.
3.  **Build & Push**: Crea las cajas (contenedores) de tu aplicación y las sube a la "nube" de Docker (DockerHub).
4.  **S3 Transfer**: Usamos S3 como un "puente". Subimos ahí el archivo `docker-compose.yml` porque es el mapa que le dirá a tu servidor EC2 cómo armar las piezas.
5.  **SSH Action**: Esto es lo más mágico. GitHub entra a tu servidor EC2 (usando tu llave `.pem`), descarga el `docker-compose.yml` que acabamos de subir a S3, baja las imágenes de DockerHub y arranca todo automáticamente.

### Tips Extra:
- **Seguridad**: Nunca compartas tu `EC2_PRIVATE_KEY` fuera de los Secrets de GitHub.
- **Costos**: Recuerda que S3 y EC2 tienen costos si te pasas de la capa gratuita, monitorea tu consola de AWS.
- **Errores**: Si el pipeline falla, haz clic en la pestaña **Actions** en GitHub para ver los logs y entender qué paso falló.

---

## 4. Bonus: Comandos para subir imágenes manualmente 🚀

Si quieres subir las imágenes tú mismo desde tu terminal (sin usar GitHub Actions todavía), sigue este orden para que no se te genere un "despelote":

### 1. Inicia sesión (solo una vez)

```cmd
docker login -u TU_USUARIO
```

### 2. Etiqueta y sube el FRONTEND

```cmd
docker tag proyectosemestral-frontend solgrey/ev2-devops-frontend:latest
docker push solgrey/ev2-devops-frontend:latest
```

### 3. Etiqueta y sube MS-VENTAS

```cmd
docker tag proyectosemestral-ms-ventas solgrey/ev2-devops-ms-ventas:latest
docker push solgrey/ev2-devops-ms-ventas:latest
```

### 4. Etiqueta y sube MS-DESPACHOS

```cmd
docker tag proyectosemestral-ms-despachos solgrey/ev2-devops-ms-despachos:latest
docker push solgrey/ev2-devops-ms-despachos:latest
```

### 5. Etiqueta y sube la Base de Datos

```cmd
docker tag proyectosemestral-db-despachos:latest solgrey/ev2-devops-db-despachos:latest
docker push solgrey/ev2-devops-db-despachos:latest
```

```cmd
docker tag proyectosemestral-db-ventas:latest solgrey/ev2-devops-db-ventas:latest
docker push solgrey/ev2-devops-db-ventas:latest
```

### 6. Reinicia los contenedores en tu EC2

Una vez que las imágenes estén en DockerHub, entra a tu servidor EC2 por SSH y ejecuta:

```bash
# Asegúrate de estar en la carpeta donde tienes el docker-compose.yml
cd /ruta/a/tu/proyecto

# Descarga las nuevas imágenes y reinicia
export DB_USER=tu_usuario
export DB_PASS=tu_contraseña
docker compose pull
docker compose up -d
``` 

> [!TIP]
> **¿Por qué usamos `solgrey/ev2-devops-...`?**
> Usando este prefijo, todas tus imágenes quedarán agrupadas bajo el mismo proyecto en DockerHub y será mucho más fácil de administrar.

proyectosemestral-db-despachos:latest