#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
USER_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJycnJyIiwiaWF0IjoxNzYyODk5Nzg4LCJleHAiOjE3NjI5ODYxODh9.ZX6kHeh9a0yMxHk6McmhP9nDn6SOzYJTPXQV9CryJZnB5AsciBTUSrSTjsD7nv17"
ADMIN_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2Mjg5OTYxNSwiZXhwIjoxNzYyOTg2MDE1fQ.fj9KNdkH1WQhoZzYK9v2-kYazX7CFFhqy10p8mappVuRDjcePuzZfbSGjAgnXtZY"  # ⚠️ You need an admin token for GET requests
BASE_URL="http://localhost:8080"
CURRENT_USER="rrrr"       # The user who owns the token
TARGET_USER_ID="21"        # User ID to report
TARGET_POST_ID="2"        # Post ID to report
# ====================================

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Testing Report Endpoints         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════╝${NC}"
echo -e "${BLUE}Current User: $CURRENT_USER${NC}"
echo -e "${BLUE}Target User ID: $TARGET_USER_ID | Target Post ID: $TARGET_POST_ID${NC}\n"

# ============================================================
# USER TESTS (Available to all authenticated users)
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  REGULAR USER TESTS (Creating Reports)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 1: Report a user
echo -e "${GREEN}1. Reporting user (ID: $TARGET_USER_ID) for spam...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"This user is posting spam content repeatedly\",
    \"reportedUserId\": $TARGET_USER_ID
  }"
echo -e "\n\n"

# Test 2: Report a post
echo -e "${GREEN}2. Reporting post (ID: $TARGET_POST_ID) for harassment...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"This post contains harassment and offensive language\",
    \"reportedPostId\": $TARGET_POST_ID
  }"
echo -e "\n\n"

# Test 3: Try to report both user and post (should fail)
echo -e "${GREEN}3. ${RED}[SHOULD FAIL]${GREEN} Attempting to report both user AND post...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"Testing invalid request\",
    \"reportedUserId\": $TARGET_USER_ID,
    \"reportedPostId\": $TARGET_POST_ID
  }"
echo -e "\n\n"

# Test 4: Try to report without specifying target (should fail)
echo -e "${GREEN}4. ${RED}[SHOULD FAIL]${GREEN} Attempting to report without target...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"Testing invalid request\"
  }"
echo -e "\n\n"

# Test 5: Try to report the same user again (should fail - duplicate)
echo -e "${GREEN}5. ${RED}[SHOULD FAIL]${GREEN} Attempting duplicate report on same user...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"Duplicate report attempt\",
    \"reportedUserId\": $TARGET_USER_ID
  }"
echo -e "\n\n"

# Test 6: Report with different reasons
echo -e "${GREEN}6. Reporting another post for different reason...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"Inappropriate content - explicit material\",
    \"reportedPostId\": 3
  }"
echo -e "\n\n"

# Test 7: Regular user tries to view all reports (should fail - 403)
echo -e "${GREEN}7. ${RED}[SHOULD FAIL - 403 Forbidden]${GREEN} Regular user trying to view all reports...${NC}"
curl -X GET "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n\n"

# ============================================================
# ADMIN TESTS (Only for admin users)
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  ADMIN TESTS (Viewing Reports)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Check if admin token is set
if [ "$ADMIN_TOKEN" = "PUT_ADMIN_TOKEN_HERE" ]; then
    echo -e "${RED}⚠️  ADMIN_TOKEN not configured. Skipping admin tests.${NC}"
    echo -e "${YELLOW}To test admin endpoints:${NC}"
    echo -e "${YELLOW}1. Register/login as admin user${NC}"
    echo -e "${YELLOW}2. Copy the token${NC}"
    echo -e "${YELLOW}3. Set ADMIN_TOKEN variable in this script${NC}\n"
else
    # Test 8: Admin views all reports
    echo -e "${GREEN}8. Admin viewing all reports...${NC}"
    curl -X GET "$BASE_URL/reports" \
      -H "Authorization: Bearer $ADMIN_TOKEN"
    echo -e "\n\n"

    # Test 9: Admin views reports for specific user
    echo -e "${GREEN}9. Admin viewing reports for user ID: $TARGET_USER_ID...${NC}"
    curl -X GET "$BASE_URL/reports/user/$TARGET_USER_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN"
    echo -e "\n\n"

    # Test 10: Admin views reports for specific post
    echo -e "${GREEN}10. Admin viewing reports for post ID: $TARGET_POST_ID...${NC}"
    curl -X GET "$BASE_URL/reports/post/$TARGET_POST_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN"
    echo -e "\n\n"

    # Test 11: Admin views reports for non-existent user (should return empty or 404)
    echo -e "${GREEN}11. Admin checking reports for non-existent user (ID: 99999)...${NC}"
    curl -X GET "$BASE_URL/reports/user/99999" \
      -H "Authorization: Bearer $ADMIN_TOKEN"
    echo -e "\n\n"
fi

# ============================================================
# SUMMARY
# ============================================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Tests 1-2: Should succeed (valid reports)${NC}"
echo -e "${RED}✗ Tests 3-5: Should fail (invalid requests)${NC}"
echo -e "${GREEN}✓ Test 6: Should succeed (another valid report)${NC}"
echo -e "${RED}✗ Test 7: Should fail 403 (user trying admin endpoint)${NC}"
if [ "$ADMIN_TOKEN" != "PUT_ADMIN_TOKEN_HERE" ]; then
    echo -e "${GREEN}✓ Tests 8-11: Admin endpoints (if token valid)${NC}"
else
    echo -e "${YELLOW}⚠ Tests 8-11: Skipped (no admin token)${NC}"
fi
echo ""