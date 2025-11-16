#!/bin/bash

echo "========================================"
echo "Starting Diskusi Bisnis Platform"
echo "========================================"
echo ""

echo "[1/2] Starting Backend Server (Express)..."
cd backend
npm run dev &
BACKEND_PID=$!
sleep 3

echo "[2/2] Starting Frontend Server (Next.js)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "✅ Both servers are running"
echo "========================================"
echo ""
echo "Backend:  http://localhost:5000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
