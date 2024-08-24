# Node
from node:20.15.0

# Install Nano
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "nano"]

# App Directory
WORKDIR /srv/OmniDownloader

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Expose port
EXPOSE 3069

# Start app
CMD ["npm", "run", "start"]