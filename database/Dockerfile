FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# No CMD - Kubernetes Jobs will specify CMD overrides (migrate or seed)
