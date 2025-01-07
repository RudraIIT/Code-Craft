FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    gcc \
    g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY demo.cpp /app/

