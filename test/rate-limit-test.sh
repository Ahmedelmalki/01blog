#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJyb2xlcyI6WyJVU0VSIl0sInN1YiI6InRlc3RlcjMiLCJpYXQiOjE3NjcyNDM0NTQsImV4cCI6MTc2NzMyOTg1NH0.WYWx6MPyoFdrjEXQoSJ19zKZEgNtkWbECqw_X1c1lgQq8ukdK75RMKswkEJpD01f"
BASE_URL="http://localhost:8080"
CURRENT_USER="tester3"
# ====================================

echo -e "${BLUE}=== Testing Rate Limiter with 200 Posts ===${NC}\n"

# Counters
SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0
ERROR_COUNT=0

# Create 200 posts
for i in {1..200}
do
    echo -e "${YELLOW}Creating post #$i...${NC}"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/posts" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"title\": \"$i\",
            \"content\": \"f*ck you\"
        }")
    
    # Extract HTTP status code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo -e "${GREEN}✓ Post #$i created successfully (HTTP $HTTP_CODE)${NC}"
    elif [ "$HTTP_CODE" -eq 429 ]; then
        RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
        echo -e "${RED}✗ Post #$i RATE LIMITED (HTTP 429)${NC}"
    else
        ERROR_COUNT=$((ERROR_COUNT + 1))
        echo -e "${RED}✗ Post #$i failed with HTTP $HTTP_CODE${NC}"
        echo -e "${RED}Response: $BODY${NC}"
    fi
    
    # Optional: small delay to avoid overwhelming the server instantly
    # sleep 0.1
    
done

echo -e "\n${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}Successful posts: $SUCCESS_COUNT${NC}"
echo -e "${RED}Rate limited: $RATE_LIMITED_COUNT${NC}"
echo -e "${RED}Other errors: $ERROR_COUNT${NC}"
echo -e "${BLUE}Total attempts: 200${NC}"