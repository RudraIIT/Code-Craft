FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    git \
    lsb-release \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmybash/oh-my-bash/master/tools/install.sh)" \
    && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000

