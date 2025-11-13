#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

ADMIN_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2MzAzNDc5MSwiZXhwIjoxNzYzMTIxMTkxfQ.nY3j_-shEmPNemS-p9PePham5ZkvGEoAsxX8eWm-IMpG9vtcxGituU2z9M96cJLN"
USER_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJubm5uIiwiaWF0IjoxNzYzMDM0NzQ3LCJleHAiOjE3NjMxMjExNDd9.G6heMTF_3KMWUfQg0A38ap9St2POyhB4qX4YR_6vw40tDbAFejndncle5EIArMyL"
BASE_URL="http://localhost:8080"

echo -e "${BLUE}Testing Admin Endpoints${NC}\n"

# Test 1: Get dashboard (admin only)
echo -e "${GREEN}1. Getting admin dashboard...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 2: Ban a user
echo -e "${GREEN}2. Banning user ID 2...${NC}"
curl -X PUT "$BASE_URL/admin/users/26/ban" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 3: Banned user tries to post (should fail 403)
echo -e "${GREEN}3. ${RED}[SHOULD FAIL]${GREEN} Banned user trying to create post...${NC}"
curl -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Should fail"}'
echo -e "\n\n"

# Test 4: Unban user
echo -e "${GREEN}4. Unbanning user ID 2...${NC}"
curl -X PUT "$BASE_URL/admin/users/26/unban" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 5: Delete post (and its reports)
echo -e "${GREEN}5. Deleting post ID 1...${NC}"
curl -X DELETE "$BASE_URL/admin/posts/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 6: Regular user tries to access admin dashboard (should fail)
echo -e "${GREEN}6. ${RED}[SHOULD FAIL 403]${GREEN} Regular user accessing admin dashboard...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n\n"