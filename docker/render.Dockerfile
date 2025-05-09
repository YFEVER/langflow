FROM langflowai/langflow:latest

# Copy custom frontend sources into the image
COPY src/frontend /app/frontend

# Re-install JS dependencies and rebuild the production bundle
RUN cd /app/frontend \
    && npm ci --prefer-offline --no-audit --progress=false \
    && npm run build

ENTRYPOINT ["python", "-m", "langflow", "run"]