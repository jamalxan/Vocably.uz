FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# Barcha modullar: index.js (bootstrap), server.js, calls.js, persist.js (+ testlar, zararsiz).
COPY *.js ./
USER node
EXPOSE 4001
CMD ["node", "index.js"]
