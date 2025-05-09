# -------- Stage 1: build the customised React frontend --------
FROM node:lts-bookworm AS frontend-builder

# Set workdir inside the builder image
WORKDIR /app/frontend

# Copy frontend sources
COPY src/frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false
COPY src/frontend .

# Build the production bundle
RUN npm run build


# -------- Stage 2: final runtime image --------
FROM langflowai/langflow:latest

# Overwrite the bundled frontend with our freshly-built assets
# Langflow serves static files from /app/src/backend/base/langflow/frontend
COPY --from=frontend-builder /app/frontend/build/ /app/src/backend/base/langflow/frontend/

# Default entrypoint (unchanged)
ENTRYPOINT ["python", "-m", "langflow", "run"]