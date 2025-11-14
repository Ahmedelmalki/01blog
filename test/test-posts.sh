#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6M…KaGhkr1Feuv3naceBNXJjk_wZePz7Ti0wP9yzyahXtgJh6747"
BASE_URL="http://localhost:8080"
CURRENT_USER="rrrr"      # The user who owns the token
# ====================================

echo -e "${BLUE}Testing Posts Endpoints${NC}"

# Test 2: Check follow status
curl -X GET "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"