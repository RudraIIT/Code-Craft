FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    git \
    gcc \
    g++ \
    curl \
    && bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmybash/oh-my-bash/master/tools/install.sh)" \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY demo.cpp /app/
