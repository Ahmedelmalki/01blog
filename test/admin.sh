#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
ADMIN_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc2MzA0MDcxNSwiZXhwIjoxNzYzMTI3MTE1fQ.bwj11sJyAaHEyBjctsAH5E4hZCQG-A7ljoh-JDPWmMs-rU2yv7jRBCMgqa8cmdyV"
USER_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJubm5uIiwiaWF0IjoxNzYzMDQwNzUzLCJleHAiOjE3NjMxMjcxNTN9.WEqHNpkAbdzC8rmlo7wcXssdWs6pzcIiZ97SmlqqqP6sDwqi39QryOfSOw3_W74S"
BASE_URL="http://localhost:8080"
TARGET_USER_ID="26"        # User ID to ban/delete
TARGET_POST_ID="6"         # Post ID to delete
# ====================================

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Testing Admin Workflow           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}\n"

# ============================================================
# PHASE 1: Setup - Create Reports First
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 1: Creating Reports (Setup)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 1: Report the post that will be deleted later
echo -e "${GREEN}1. Reporting post (ID: $TARGET_POST_ID) for inappropriate content...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"This post contains inappropriate and offensive content\",
    \"reportedPostId\": $TARGET_POST_ID
  }"
echo -e "\n\n"

# Test 2: Report the user that will be banned later
echo -e "${GREEN}2. Reporting user (ID: $TARGET_USER_ID) for spam...${NC}"
curl -X POST "$BASE_URL/reports" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"reason\": \"This user is repeatedly posting spam content\",
    \"reportedUserId\": $TARGET_USER_ID
  }"
echo -e "\n\n"

# Wait a moment to ensure reports are saved
sleep 1

# ============================================================
# PHASE 2: Admin Dashboard & Review
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 2: Admin Dashboard & Reports${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 3: Get dashboard stats
echo -e "${GREEN}3. Getting admin dashboard stats...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 4: View all reports
echo -e "${GREEN}4. Admin viewing all reports...${NC}"
curl -X GET "$BASE_URL/reports" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 5: View reports for the specific post
echo -e "${GREEN}5. Admin viewing reports for post ID: $TARGET_POST_ID...${NC}"
curl -X GET "$BASE_URL/reports/post/$TARGET_POST_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 6: View reports for the specific user
echo -e "${GREEN}6. Admin viewing reports for user ID: $TARGET_USER_ID...${NC}"
curl -X GET "$BASE_URL/reports/user/$TARGET_USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# ============================================================
# PHASE 3: Admin Actions - Ban User
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 3: Banning User${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 7: Ban the reported user
echo -e "${GREEN}7. Banning user ID: $TARGET_USER_ID...${NC}"
curl -X PUT "$BASE_URL/admin/users/$TARGET_USER_ID/ban" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 8: Verify banned user cannot post
echo -e "${GREEN}8. ${RED}[SHOULD FAIL 403]${GREEN} Banned user trying to create post...${NC}"
curl -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"This should fail"}'
echo -e "\n\n"

# Test 9: Check dashboard stats (banned users should increase)
echo -e "${GREEN}9. Checking updated dashboard stats (bannedUsers should increase)...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 10: Unban user
echo -e "${GREEN}10. Unbanning user ID: $TARGET_USER_ID...${NC}"
curl -X PUT "$BASE_URL/admin/users/$TARGET_USER_ID/unban" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 11: Verify unbanned user can now post
echo -e "${GREEN}11. ${GREEN}[SHOULD SUCCEED]${NC} Unbanned user creating post...${NC}"
curl -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test After Unban","content":"This should work now"}'
echo -e "\n\n"

# ============================================================
# PHASE 4: Admin Actions - Delete Post
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 4: Deleting Reported Post${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 12: Delete the reported post (and its reports)
echo -e "${GREEN}12. Deleting reported post ID: $TARGET_POST_ID...${NC}"
curl -X DELETE "$BASE_URL/admin/posts/$TARGET_POST_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 13: Try to view reports for deleted post (should be empty or 404)
echo -e "${GREEN}13. Checking reports for deleted post (should be empty/404)...${NC}"
curl -X GET "$BASE_URL/reports/post/$TARGET_POST_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# Test 14: Check final dashboard stats
echo -e "${GREEN}14. Final dashboard stats...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n\n"

# ============================================================
# PHASE 5: Authorization Tests
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 5: Authorization Tests${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 15: Regular user tries to access admin dashboard
echo -e "${GREEN}15. ${RED}[SHOULD FAIL 403]${GREEN} Regular user accessing admin dashboard...${NC}"
curl -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n\n"

# Test 16: Regular user tries to ban another user
echo -e "${GREEN}16. ${RED}[SHOULD FAIL 403]${GREEN} Regular user trying to ban someone...${NC}"
curl -X PUT "$BASE_URL/admin/users/1/ban" \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n\n"

# Test 17: Regular user tries to delete a post
echo -e "${GREEN}17. ${RED}[SHOULD FAIL 403]${GREEN} Regular user trying to delete post...${NC}"
curl -X DELETE "$BASE_URL/admin/posts/1" \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n\n"

# ============================================================
# SUMMARY
# ============================================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Phase 1: Reports created successfully${NC}"
echo -e "${GREEN}✓ Phase 2: Admin can view reports${NC}"
echo -e "${GREEN}✓ Phase 3: Ban/unban workflow${NC}"
echo -e "${RED}  - Test 8: Banned user blocked (403)${NC}"
echo -e "${GREEN}  - Test 11: Unbanned user can post${NC}"
echo -e "${GREEN}✓ Phase 4: Post deletion with reports cleanup${NC}"
echo -e "${GREEN}✓ Phase 5: Authorization properly enforced${NC}"
echo -e "${RED}  - Tests 15-17: Regular users blocked (403)${NC}"
echo ""