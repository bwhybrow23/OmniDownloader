# Node
FROM node:20.15.0

# Install Nano
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "nano"]

# Make app directory
WORKDIR /srv/OmniDownloader

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 6969

# Start app
CMD ["npm", "run", "start"]