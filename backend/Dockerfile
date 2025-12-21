# Gunakan Node.js LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Jalankan server
CMD ["npm", "run", "dev"]
