FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_STORAGE_PUBLIC_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_STORAGE_PUBLIC_URL=${VITE_STORAGE_PUBLIC_URL}

RUN npm run build

FROM node:22-alpine
WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_STORAGE_PUBLIC_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_STORAGE_PUBLIC_URL=${VITE_STORAGE_PUBLIC_URL}
ENV HOST=0.0.0.0
ENV PORT=4173

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
