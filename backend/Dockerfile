FROM debian:bookworm-slim

WORKDIR /app

# Build-time configurable default DB path
ARG DB_PATH=/app/data/webclip.db

# Minimal runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Copy prebuilt linux/amd64 binary (built by make build-linux-amd64)
COPY bin/api-linux-amd64 /app/api

# Prepare runtime directories and permissions
RUN chmod +x /app/api && mkdir -p /app/data /app/uploads

ENV TZ=Asia/Shanghai
ENV SWAGGER_ENABLED=false
ENV DB_PATH=${DB_PATH}

EXPOSE 8080

ENTRYPOINT ["/app/api"]
