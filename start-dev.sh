#!/bin/bash

echo "Starting development servers..."

# Get the local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ipconfig getifaddr en0)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
fi

echo "Your local IP address is: $IP"

echo "Starting server..."
cd server && npm start &
SERVER_PID=$!

echo "Starting client..."
cd client && npm run dev -- --host &
CLIENT_PID=$!

echo ""
echo "Access the application from your mobile device at:"
echo "http://$IP:5173"
echo ""
echo "Press Ctrl+C to exit..."

# Wait for user to press Ctrl+C
trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
