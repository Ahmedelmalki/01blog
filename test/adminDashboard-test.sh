#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

ADMIN_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2MzAzNjQ5MywiZXhwIjoxNzYzMTIyODkzfQ.6YGBlLbEiohXJf52_qxRIxg5jPj4JopxrJdn01i3znp0AeEZWq54Ivo5onG3VOuj"
USER_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJ2dnZ2IiwiaWF0IjoxNzYzMDM2NTM2LCJleHAiOjE3NjMxMjI5MzZ9.K-qJgqoF0TnQABp95o7vtbOZL6Q2lin8pQPvZdMo0xQDeDuqnLmwnY3lmsYezqcz"
BASE_URL="http://localhost:8080"

echo -e "${BLUE}Testing Admin Endpoints${NC}\n"

# Test 1: Get dashboard (admin only)
echo -e "${GREEN}1. Getting admin dashboard...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 2: Ban a user
echo -e "${GREEN}2. Banning user ID 2...${NC}"
curl -X PUT "$BASE_URL/admin/users/21/ban" \
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
curl -X PUT "$BASE_URL/admin/users/21/unban" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 5: Delete post (and its reports)
echo -e "${GREEN}5. Deleting post ID 1...${NC}"
curl -X DELETE "$BASE_URL/admin/posts/3" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 6: Regular user tries to access admin dashboard (should fail)
echo -e "${GREEN}6. ${RED}[SHOULD FAIL 403]${GREEN} Regular user accessing admin dashboard...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n\n"