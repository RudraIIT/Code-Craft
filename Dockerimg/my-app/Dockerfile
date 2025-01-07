FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

