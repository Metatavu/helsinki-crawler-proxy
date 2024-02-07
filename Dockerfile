FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 (or any other port your application listens on)
EXPOSE 3000

# Command to run the application
CMD [ "npm", "run", "prod" ]