# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build frontend and backend
RUN npm run build --workspace=frontend
RUN npm run build --workspace=backend

# Copy frontend build to backend dist
RUN npm run postbuild

# Verify the files are copied
RUN echo "=== Checking backend/dist/public ===" && \
    ls -la backend/dist/ && \
    ls -la backend/dist/public/ && \
    echo "=== Files found in backend/dist/public ==="

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
