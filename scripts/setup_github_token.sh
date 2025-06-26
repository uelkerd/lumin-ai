#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================================${NC}"
echo -e "${BLUE}     LUMIN.AI GitHub Token Setup Guide${NC}"
echo -e "${BLUE}=========================================================${NC}"
echo -e ""
echo -e "${GREEN}This script will help you create a GitHub personal access token${NC}"
echo -e "${GREEN}with the correct permissions for the LUMIN.AI project.${NC}"
echo -e ""
echo -e "${YELLOW}Steps to create a GitHub token:${NC}"
echo -e ""
echo -e "1. Go to ${BLUE}https://github.com/settings/tokens${NC}"
echo -e "2. Click '${GREEN}Generate new token${NC}' -> '${GREEN}Generate new token (classic)${NC}'"
echo -e "3. Add a note like '${GREEN}LUMIN.AI Project Management${NC}'"
echo -e "4. Set an expiration date (30 days recommended)"
echo -e "5. Select the following scopes:"
echo -e "   - ${YELLOW}repo${NC} (Full control of private repositories)"
echo -e "   - ${YELLOW}admin:org${NC} -> ${YELLOW}read:org${NC} (Read org and team membership)"
echo -e "   - ${YELLOW}project${NC} (Full control of user projects)"
echo -e "6. Click '${GREEN}Generate token${NC}'"
echo -e "7. ${RED}Copy the token immediately${NC} as you won't be able to see it again"
echo -e ""
echo -e "${YELLOW}Testing your token:${NC}"
echo -e ""

read -p "Enter your GitHub username: " username
read -sp "Enter your GitHub token: " token
echo ""

# Test the token
echo -e "\n${BLUE}Testing token access...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $token" https://api.github.com/user)

if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Token is valid!${NC}"

    # Test repo access
    echo -e "${BLUE}Testing repository access...${NC}"
    repo_response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $token" https://api.github.com/repos/uelkerd/lumin-ai)

    if [ $repo_response -eq 200 ]; then
        echo -e "${GREEN}✓ Repository access confirmed!${NC}"

        # Save token to .env file
        read -p "Would you like to save this token to a .env file? (y/n): " save_token
        if [[ $save_token == "y" || $save_token == "Y" ]]; then
            echo "GITHUB_TOKEN=$token" > .env
            echo -e "${GREEN}Token saved to .env file${NC}"
            echo -e "${YELLOW}Note: This file is git-ignored and should remain private${NC}"
        fi

        echo -e "\n${GREEN}You can now run GitHub scripts with:${NC}"
        echo -e "python scripts/prune_backlog.py --token $token"
        echo -e "\n${YELLOW}Example with dry-run (no actual changes):${NC}"
        echo -e "python scripts/prune_backlog.py --token $token --dry-run"
    else
        echo -e "${RED}✗ Repository access failed (HTTP $repo_response)${NC}"
        echo -e "${YELLOW}Make sure you selected the 'repo' scope when creating your token.${NC}"
    fi
else
    echo -e "${RED}✗ Token validation failed (HTTP $response)${NC}"
    echo -e "${YELLOW}Please check your token and try again.${NC}"
fi

echo -e "\n${BLUE}=========================================================${NC}"