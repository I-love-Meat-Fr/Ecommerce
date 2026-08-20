# Run both Backend (API) and Frontend simultaneously
# Usage: ./run-all.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================="
echo "Starting Ecommerce Application"
echo "========================================="
echo ""

# Backend
echo "[1/2] Starting Backend API..."
cd "$SCRIPT_DIR/api"
dotnet run &
BE_PID=$!

echo "       Backend PID: $BE_PID"
echo ""

# Frontend
echo "[2/2] Starting Frontend..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FE_PID=$!

echo "       Frontend PID: $FE_PID"
echo ""

echo "========================================="
echo "Both services started!"
echo "  - API:    http://localhost:5000"
echo "  - Swagger: http://localhost:5000/swagger"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="

# Wait for any process to exit
wait
