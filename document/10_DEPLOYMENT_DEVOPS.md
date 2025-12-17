# 🚀 DEPLOYMENT & DEVOPS GUIDE

## 📋 MỤC LỤC
1. [Infrastructure Overview](#infrastructure-overview)
2. [Docker Setup](#docker-setup)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Environment Configuration](#environment-configuration)
5. [Database Migrations](#database-migrations)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)
8. [Scaling Strategy](#scaling-strategy)

---

## 🏗️ INFRASTRUCTURE OVERVIEW

### Architecture
```
┌─────────────────────────────────────────┐
│         Load Balancer (Nginx)           │
└─────────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌──────────┐      ┌──────────┐
│ API Pod 1│      │ API Pod 2│
│ (NestJS) │      │ (NestJS) │
└──────────┘      └──────────┘
    │                   │
    └─────────┬─────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌──────────┐      ┌──────────┐
│PostgreSQL│      │  Redis   │
│ Primary  │      │ Cluster  │
└──────────┘      └──────────┘
    │
┌──────────┐
│PostgreSQL│
│ Replica  │
└──────────┘
```

### Technology Stack
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (production)
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL 15+ (Primary + Replicas)
- **Cache**: Redis 7+ (Cluster)
- **File Storage**: AWS S3 / MinIO
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack / Loki

---

## 🐳 DOCKER SETUP

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cosmetic_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/cosmetic_db
      REDIS_URL: redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t backend:latest ./backend
          docker build -t frontend:latest ./frontend
      
      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag backend:latest ${{ secrets.REGISTRY }}/backend:${{ github.sha }}
          docker tag frontend:latest ${{ secrets.REGISTRY }}/frontend:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/backend:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deploy to Kubernetes or server
          kubectl set image deployment/backend backend=${{ secrets.REGISTRY }}/backend:${{ github.sha }}
          kubectl set image deployment/frontend frontend=${{ secrets.REGISTRY }}/frontend:${{ github.sha }}
```

---

## ⚙️ ENVIRONMENT CONFIGURATION

### Environment Variables
```bash
# .env.production
NODE_ENV=production

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-secure-password
DB_NAME=cosmetic_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=cosmetic-storage

# API
API_BASE_URL=https://api.example.com
FRONTEND_URL=https://example.com

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Config Module
```typescript
// src/config/app.config.ts
import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}))
```

---

## 🗄️ DATABASE MIGRATIONS

### Migration Strategy
```typescript
// Run migrations on deployment
// scripts/migrate.sh
#!/bin/bash
set -e

echo "Running database migrations..."

npm run migration:run

echo "Migrations completed successfully"
```

### Migration Script
```typescript
// database/migrations/001_initial_schema.ts
import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ...
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE products`)
  }
}
```

---

## 📊 MONITORING & LOGGING

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nestjs-api'
    static_configs:
      - targets: ['backend:3000']
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "API Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      }
    ]
  }
}
```

### Logging Configuration
```typescript
// Winston logger
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
})
```

---

## 💾 BACKUP & RECOVERY

### Database Backup Script
```bash
#!/bin/bash
# scripts/backup-db.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cosmetic_db_$DATE.sql"

# Create backup
pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_NAME > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://backups/cosmetic-db/

# Delete old backups (keep last 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Automated Backups
```yaml
# Kubernetes CronJob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h $DB_HOST -U $DB_USERNAME -d $DB_NAME | gzip > /backup/backup.sql.gz
              aws s3 cp /backup/backup.sql.gz s3://backups/
          restartPolicy: OnFailure
```

---

## 📈 SCALING STRATEGY

### Horizontal Scaling
```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: backend:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Auto Scaling
```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup strategy in place

### Deployment
- [ ] Run database migrations
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verify health checks
- [ ] Test critical endpoints

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups
- [ ] Update documentation

---

## 📝 NEXT STEPS

1. Setup Docker containers
2. Configure CI/CD pipeline
3. Setup monitoring
4. Configure backups
5. Setup auto-scaling
6. Performance testing
7. Security audit
8. Documentation

