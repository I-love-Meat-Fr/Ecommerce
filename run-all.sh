#!/usr/bin/env bash
# Run both Backend (ASP.NET API on :5126) and Frontend (Vite on :5173+).
# Usage:
#   ./run-all.sh              # build + run
#   ./run-all.sh --skip-build # use last build
#
# Stops both processes (and their child trees) on Ctrl+C.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR/api"
FE_DIR="$SCRIPT_DIR/frontend"
API_PORT=5126
FE_PORT=5173
SKIP_BUILD=""

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD="--no-build" ;;
    -h|--help)
      sed -n '2,12p' "$0"; exit 0 ;;
  esac
done

echo "=========================================="
echo " Ecommerce - dev launcher (bash)"
echo "=========================================="

# ---- preflight ---------------------------------------------------------
if ! command -v dotnet >/dev/null 2>&1; then
  if [ -x "/c/Program Files/dotnet/dotnet.exe" ]; then
    export PATH="/c/Program Files/dotnet:$PATH"
  elif [ -x "C:/Program Files/dotnet/dotnet.exe" ]; then
    export PATH="/c/Program Files/dotnet:$PATH"
  else
    echo "ERROR: dotnet not on PATH. Install .NET 8 SDK:"
    echo "       winget install --id Microsoft.DotNet.SDK.8 -e"
    exit 1
  fi
fi

if ! dotnet --info 2>/dev/null | grep -q "SDKs installed:"; then
  echo "ERROR: dotnet found but no SDK installed (.NET 6/8/9 runtimes only)."
  echo "       winget install --id Microsoft.DotNet.SDK.8 -e"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm not on PATH. Install Node.js LTS first."
  exit 1
fi

if [ ! -f "$API_DIR/Ecommer.Api.csproj" ]; then
  echo "ERROR: api/Ecommer.Api.csproj missing."
  exit 1
fi
if [ ! -f "$FE_DIR/package.json" ]; then
  echo "ERROR: frontend/package.json missing."
  exit 1
fi

# ---- port guard --------------------------------------------------------
if command -v ss >/dev/null 2>&1; then
  if ss -ltn "sport = :$API_PORT" 2>/dev/null | grep -q ":$API_PORT"; then
    echo "ERROR: port $API_PORT already in use."
    echo "       Stop the existing dotnet: pkill -f 'dotnet run' "
    exit 1
  fi
elif command -v netstat >/dev/null 2>&1; then
  if netstat -ano 2>/dev/null | grep -E ":${API_PORT} .*LISTENING" >/dev/null; then
    echo "ERROR: port $API_PORT already in use."
    exit 1
  fi
fi

# ---- launch -----------------------------------------------------------
echo ""
echo "[1/2] Starting backend on http://localhost:$API_PORT ..."

# Prefix every backend line with [BE]
(
  cd "$API_DIR"
  dotnet run --project "$API_DIR" --launch-profile http $SKIP_BUILD 2>&1 \
    | sed -u 's/^/[BE] /'
) &
BE_PID=$!

echo "[2/2] Starting frontend (Vite) ..."
(
  cd "$FE_DIR"
  npm run dev 2>&1 \
    | sed -u 's/^/[FE] /'
) &
FE_PID=$!

echo ""
echo "=========================================="
echo " Both services starting"
echo "   API  -> http://localhost:$API_PORT"
echo "   SPA  -> http://localhost:$FE_PORT (auto-bump if busy)"
echo " Press Ctrl+C to stop everything"
echo "=========================================="
echo ""

cleanup() {
  echo ""
  echo "Stopping services..."
  # Kill the whole dotnet / node tree (children included).
  pkill -P "$BE_PID" 2>/dev/null
  pkill -P "$FE_PID" 2>/dev/null
  kill "$BE_PID" "$FE_PID" 2>/dev/null
  # Belt + braces: any leftover dotnet/node spawned inside the repo
  pkill -f "$API_DIR" 2>/dev/null
  pkill -f "$FE_DIR"  2>/dev/null
  sleep 1
  kill -9 "$BE_PID" "$FE_PID" 2>/dev/null || true
  echo "Stopped."
}
trap cleanup INT TERM EXIT

# Wait for either process to exit.
wait "$BE_PID" "$FE_PID"
exit_status=$?
cleanup
exit $exit_status