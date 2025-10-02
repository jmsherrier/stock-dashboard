#!/bin/bash

echo "Starting Volatiliraptor Stock Dashboard..."
echo ""
echo "Starting backend server..."

# Start backend server in background
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

echo "Starting frontend..."
npm start

# Cleanup function to kill background processes
cleanup() {
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null
    exit
}

# Trap ctrl+c and cleanup
trap cleanup INT TERM