#!/bin/bash

set -e
set -o pipefail

echo "Starting backend setup..."
cd backend || { echo "Failed to change to /backend directory"; exit 1; }
npm install
npm run dev &

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend setup in a new terminal..."
gnome-terminal -- bash -c "cd .. && cd frontend && npm install && npm run dev; exec bash"
