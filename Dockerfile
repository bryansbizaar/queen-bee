# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.20.4
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed for production
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy package files and install production dependencies
COPY package-lock.json package.json ./
RUN npm ci --omit=dev

# Copy pre-built client and server code
COPY client/dist ./client/dist
COPY server ./server
COPY database ./database

# Start the server
EXPOSE 8080
CMD [ "npm", "run", "start" ]
