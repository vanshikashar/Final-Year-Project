FROM 864899835094.dkr.ecr.ap-south-1.amazonaws.com/docker-hub/library/node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["npm", "start"]