# Dockerfile para ms-despachos
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
COPY ms-despachos /app/ms-despachos

# Construir el JAR
RUN mvn -pl ms-despachos clean package -DskipTests

# Etapa de ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/ms-despachos/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
