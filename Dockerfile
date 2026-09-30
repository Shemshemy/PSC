# syntax=docker/dockerfile:1
# Public Service Commission (PSC) Kenya - Production Container Image
FROM node:22-alpine

# Set deployment environment variables
ENV NODE_ENV=production \
    PORT=5000

# Create application working directory
WORKDIR /usr/src/app

# Copy application files (with ownership assigned to node user)
COPY --chown=node:node . .

# Use non-root user for principle of least privilege
USER node

# Expose primary port
EXPOSE 5000

# Native zero-dependency healthcheck probe against Kubernetes liveness endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/healthz/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Launch native Node.js 22 enterprise gateway server
CMD ["node", "server/server.js"]
