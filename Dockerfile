FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create directories
RUN mkdir -p data test

# Expose port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]