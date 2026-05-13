# Dockerfile para ms-ventas
# Se debe ejecutar con el contexto en la carpeta 'backend'
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar el POM padre
COPY pom.xml .

# Copiar los POM de los módulos (para caché de dependencias)
COPY ms-ventas/pom.xml ms-ventas/
COPY ms-despachos/pom.xml ms-despachos/

# Descargar dependencias
RUN mvn dependency:go-offline -B

# Copiar el código fuente
COPY ms-ventas /app/ms-ventas

# Construir el JAR
RUN mvn -pl ms-ventas clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/ms-ventas/target/*.jar app.jar
EXPOSE 8080 
ENTRYPOINT ["java", "-jar", "app.jar"]
