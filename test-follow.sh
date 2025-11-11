#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJycnJyIiwiaWF0IjoxNzYyODcxNTQ4LCJleHAiOjE3NjI5NTc5NDh9.kbUQ9dzdTMke8A67x1_fPpH361kaBanpypoeCqXDxjjog497mkF3l3-GYv_dCXH-"
BASE_URL="http://localhost:8080"
CURRENT_USER="rrrr"      # The user who owns the token
TARGET_USER="oooo"       # The user to follow/interact with
# ====================================

echo -e "${BLUE}Testing Follow Endpoints${NC}"
echo -e "${BLUE}Current User: $CURRENT_USER | Target User: $TARGET_USER${NC}\n"

# Test 1: Follow a user
echo -e "${GREEN}1. Following user '$TARGET_USER'...${NC}"
curl -X POST "$BASE_URL/follow/$TARGET_USER" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Check follow status
echo -e "${GREEN}2. Checking if '$CURRENT_USER' follows '$TARGET_USER'...${NC}"
curl -X GET "$BASE_URL/follow/status/$TARGET_USER" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 3: Get following list (who CURRENT_USER is following)
echo -e "${GREEN}3. Getting who '$CURRENT_USER' is following...${NC}"
curl -X GET "$BASE_URL/follow/$CURRENT_USER/following" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 4: Get followers list (who follows TARGET_USER)
echo -e "${GREEN}4. Getting who follows '$TARGET_USER'...${NC}"
curl -X GET "$BASE_URL/follow/$TARGET_USER/followers" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 5: Get stats for CURRENT_USER
echo -e "${GREEN}5. Getting follow stats for '$CURRENT_USER'...${NC}"
curl -X GET "$BASE_URL/follow/$CURRENT_USER/stats" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 6: Get stats for TARGET_USER
echo -e "${GREEN}6. Getting follow stats for '$TARGET_USER'...${NC}"
curl -X GET "$BASE_URL/follow/$TARGET_USER/stats" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test 7: Unfollow
echo -e "${GREEN}7. Unfollowing user '$TARGET_USER'...${NC}"
curl -X POST "$BASE_URL/follow/$TARGET_USER" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n"