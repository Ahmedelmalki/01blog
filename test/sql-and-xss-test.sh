#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ========== CONFIGURATION ==========
USER_TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJyb2xlcyI6WyJVU0VSIl0sInN1YiI6Im9vb28iLCJpYXQiOjE3NjcwOTQyMjUsImV4cCI6MTc2NzE4MDYyNX0.NmLWQs2xD75lO5BzepbL27el9gI6-akElPViWiDw9YncSnhNVWqdugis63bRmQ87"
BASE_URL="http://localhost:8080"
VALID_POST_ID="2"
# ====================================

echo -e "${BLUE}╔════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Security Testing: SQL & XSS      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════╝${NC}\n"

echo -e "${MAGENTA}⚠️  SECURITY AUDIT CHECKLIST:${NC}"
echo -e "${MAGENTA}   Is all input sanitized to prevent SQL injection or XSS attacks?${NC}\n"

# ============================================================
# PHASE 1: SQL Injection Tests - Path Parameter (postId)
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 1: SQL Injection - postId${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 1: Basic SQL injection in postId
echo -e "${GREEN}1. ${RED}[SHOULD FAIL]${GREEN} SQL injection: postId = 1' OR '1'='1${NC}"
curl -X POST "$BASE_URL/posts/1' OR '1'='1/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 2: SQL injection with UNION
echo -e "${GREEN}2. ${RED}[SHOULD FAIL]${GREEN} SQL injection: postId with UNION SELECT${NC}"
curl -X POST "$BASE_URL/posts/1 UNION SELECT * FROM users/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 3: SQL injection with comment
echo -e "${GREEN}3. ${RED}[SHOULD FAIL]${GREEN} SQL injection: postId with SQL comment${NC}"
curl -X POST "$BASE_URL/posts/1--/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 4: SQL injection with semicolon
echo -e "${GREEN}4. ${RED}[SHOULD FAIL]${GREEN} SQL injection: postId with semicolon${NC}"
curl -X POST "$BASE_URL/posts/1; DROP TABLE post_likes--/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 5: Encoded SQL injection
echo -e "${GREEN}5. ${RED}[SHOULD FAIL]${GREEN} SQL injection: URL-encoded OR statement${NC}"
curl -X POST "$BASE_URL/posts/1%27%20OR%20%271%27%3D%271/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# ============================================================
# PHASE 2: SQL Injection Tests - Query Parameter (value)
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 2: SQL Injection - value param${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 6: SQL injection in value parameter
echo -e "${GREEN}6. ${RED}[SHOULD FAIL]${GREEN} SQL injection: value = 1' OR '1'='1${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=1' OR '1'='1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 7: SQL injection with UNION in value
echo -e "${GREEN}7. ${RED}[SHOULD FAIL]${GREEN} SQL injection: value with UNION SELECT${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=1 UNION SELECT password FROM users--" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 8: SQL injection with DROP TABLE
echo -e "${GREEN}8. ${RED}[SHOULD FAIL]${GREEN} SQL injection: value with DROP TABLE${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=1; DROP TABLE post_likes; --" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 9: Blind SQL injection (time-based)
echo -e "${GREEN}9. ${RED}[SHOULD FAIL]${GREEN} SQL injection: value with SLEEP${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=1; SELECT SLEEP(5)--" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 10: Boolean-based blind SQL injection
echo -e "${GREEN}10. ${RED}[SHOULD FAIL]${GREEN} SQL injection: Boolean-based blind${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=1 AND 1=1--" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# ============================================================
# PHASE 3: XSS (Cross-Site Scripting) Tests
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 3: XSS Attacks${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 11: Basic XSS in value parameter
echo -e "${GREEN}11. ${RED}[SHOULD FAIL]${GREEN} XSS: <script> tag in value${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=<script>alert('XSS')</script>" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 12: XSS with event handler
echo -e "${GREEN}12. ${RED}[SHOULD FAIL]${GREEN} XSS: Image with onerror handler${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=<img src=x onerror=alert('XSS')>" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 13: URL-encoded XSS
echo -e "${GREEN}13. ${RED}[SHOULD FAIL]${GREEN} XSS: URL-encoded script tag${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 14: XSS with JavaScript protocol
echo -e "${GREEN}14. ${RED}[SHOULD FAIL]${GREEN} XSS: JavaScript protocol${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=javascript:alert('XSS')" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 15: XSS with SVG
echo -e "${GREEN}15. ${RED}[SHOULD FAIL]${GREEN} XSS: SVG with script${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=<svg/onload=alert('XSS')>" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# ============================================================
# PHASE 4: Path Traversal & Special Characters
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 4: Path Traversal & Special Chars${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 16: Path traversal
echo -e "${GREEN}16. ${RED}[SHOULD FAIL]${GREEN} Path traversal: ../../admin${NC}"
curl -X POST "$BASE_URL/posts/../../admin/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 17: Null byte injection
echo -e "${GREEN}17. ${RED}[SHOULD FAIL]${GREEN} Null byte: postId with %00${NC}"
curl -X POST "$BASE_URL/posts/1%00/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 18: Special characters in postId
echo -e "${GREEN}18. ${RED}[SHOULD FAIL]${GREEN} Special chars: postId = !@#$%^&*()${NC}"
curl -X POST "$BASE_URL/posts/!@#$%^&*()/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 19: Very long input (buffer overflow attempt)
echo -e "${GREEN}19. ${RED}[SHOULD FAIL]${GREEN} Buffer overflow: very long postId${NC}"
LONG_ID=$(python3 -c "print('9' * 1000)")
curl -X POST "$BASE_URL/posts/$LONG_ID/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 20: Negative postId
echo -e "${GREEN}20. ${RED}[SHOULD FAIL]${GREEN} Negative postId: -1${NC}"
curl -X POST "$BASE_URL/posts/-1/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# ============================================================
# PHASE 5: Type Confusion & Edge Cases
# ============================================================

echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  PHASE 5: Type Confusion${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

# Test 21: String instead of integer
echo -e "${GREEN}21. ${RED}[SHOULD FAIL]${GREEN} Type confusion: postId = 'abc'${NC}"
curl -X POST "$BASE_URL/posts/abc/like?value=1" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 22: Float instead of integer
echo -e "${GREEN}22. ${RED}[SHOULD FAIL]${GREEN} Type confusion: value = 1.5${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=1.5" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Test 23: Scientific notation
echo -e "${GREEN}23. ${RED}[SHOULD FAIL]${GREEN} Scientific notation: value = 1e10${NC}"
curl -X POST "$BASE_URL/posts/$VALID_POST_ID/like?value=1e10" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# ============================================================
# SUMMARY
# ============================================================

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Security Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${MAGENTA}EXPECTED BEHAVIOR (All should FAIL):${NC}"
echo -e "${RED}✗ Phase 1: SQL injection in postId (Tests 1-5)${NC}"
echo -e "${RED}✗ Phase 2: SQL injection in value (Tests 6-10)${NC}"
echo -e "${RED}✗ Phase 3: XSS attacks (Tests 11-15)${NC}"
echo -e "${RED}✗ Phase 4: Path traversal (Tests 16-20)${NC}"
echo -e "${RED}✗ Phase 5: Type confusion (Tests 21-23)${NC}"
echo ""
echo -e "${YELLOW}SECURITY RECOMMENDATIONS:${NC}"
echo -e "1. ✓ Use Spring Data JPA with parameterized queries"
echo -e "2. ✓ Validate postId is a valid Long (400 for invalid)"
echo -e "3. ✓ Validate value is only 1 or -1 (400 for invalid)"
echo -e "4. ✓ Return 404 for non-existent posts"
echo -e "5. ✓ Sanitize/escape any response data shown to users"
echo ""