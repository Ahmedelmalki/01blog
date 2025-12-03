#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJyb2xlcyI6WyJVU0VSIl0sInN1YiI6ImdvYXQiLCJpYXQiOjE3NjQ3Mjc5MzQsImV4cCI6MTc2NDgxNDMzNH0.NwrY860g-9wFyTdJuTjDVLwGPIUZ77cWJAgv8hmZfqAyAuwPcYbmAe7M_88taRe7"
BASE_URL="http://localhost:8080"
CURRENT_USER="goat"
# ====================================

echo -e "${BLUE}=== Debugging Following Posts ===${NC}\n"

# 1. Check who goat is following
echo -e "${GREEN}1. Checking who '$CURRENT_USER' is following:${NC}"
curl -s -X GET "$BASE_URL/follow/goat/following" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "\n"

# 2. Check all posts (to see if posts exist)
echo -e "${GREEN}2. Checking all posts:${NC}"
curl -s -X GET "$BASE_URL/posts?page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.posts[] | {id, title, author}'
echo -e "\n"

# 3. Check following feed
echo -e "${GREEN}3. Checking following feed:${NC}"
curl -s -X GET "$BASE_URL/posts/following?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo -e "\n"
