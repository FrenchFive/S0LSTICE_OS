#!/bin/bash
# S0LSTICE_OS - Build Verification Script
# This script verifies that the build will succeed in GitHub Actions

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓ PASS]${NC} $1"
    ((PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[⚠ WARN]${NC} $1"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}[✗ FAIL]${NC} $1"
    ((FAILED++))
}

log_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Start verification
log_section "S0LSTICE_OS Build Verification"
log_info "This script will verify the build matches GitHub Actions requirements"
echo ""

# 1. Check Node.js version
log_section "1. Checking Node.js Version"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)
    
    log_info "Node.js version: v$NODE_VERSION"
    
    if [ "$NODE_MAJOR" -ge 20 ]; then
        log_success "Node.js version is 20 or higher (required for GitHub Actions)"
    else
        log_error "Node.js version should be 20 or higher (current: $NODE_MAJOR)"
    fi
else
    log_error "Node.js is not installed"
fi

# 2. Check npm
log_section "2. Checking npm"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_info "npm version: $NPM_VERSION"
    log_success "npm is installed"
else
    log_error "npm is not installed"
fi

# 3. Check package.json exists
log_section "3. Checking package.json"
if [ -f "package.json" ]; then
    log_success "package.json exists"
    
    # Check for required scripts
    if grep -q '"build"' package.json; then
        log_success "Build script found in package.json"
    else
        log_error "Build script not found in package.json"
    fi
    
    if grep -q '"lint"' package.json; then
        log_success "Lint script found in package.json"
    else
        log_warning "Lint script not found in package.json"
    fi
else
    log_error "package.json not found"
fi

# 4. Check if dependencies are installed
log_section "4. Checking Dependencies"
if [ -d "node_modules" ]; then
    log_info "node_modules directory exists"
    log_success "Dependencies appear to be installed"
else
    log_warning "node_modules directory not found"
    log_info "Installing dependencies..."
    
    if npm ci; then
        log_success "Dependencies installed successfully with npm ci"
    else
        log_error "Failed to install dependencies with npm ci"
        log_info "Trying npm install..."
        if npm install; then
            log_success "Dependencies installed with npm install"
        else
            log_error "Failed to install dependencies"
        fi
    fi
fi

# 5. Run linting
log_section "5. Running ESLint"
log_info "Running: npm run lint"
echo ""

if npm run lint; then
    log_success "Linting passed with no errors"
else
    log_warning "Linting found issues (may include warnings)"
fi

# 6. Run build
log_section "6. Building Project"
log_info "Running: npm run build"
echo ""

# Clean previous build
if [ -d "dist" ]; then
    log_info "Removing previous build..."
    rm -rf dist
fi

BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT_CODE=$?

echo "$BUILD_OUTPUT"
echo ""

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    log_success "Build completed successfully"
    
    # Check build output
    if [ -d "dist" ]; then
        log_success "dist directory created"
        
        # Check for index.html
        if [ -f "dist/index.html" ]; then
            log_success "dist/index.html exists"
        else
            log_error "dist/index.html not found"
        fi
        
        # Check for assets
        if [ -d "dist/assets" ]; then
            log_success "dist/assets directory exists"
            
            # Count files
            JS_COUNT=$(find dist/assets -name "*.js" | wc -l)
            CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
            
            log_info "JavaScript files: $JS_COUNT"
            log_info "CSS files: $CSS_COUNT"
            
            if [ $JS_COUNT -gt 0 ] && [ $CSS_COUNT -gt 0 ]; then
                log_success "Build assets generated correctly"
            else
                log_warning "Build assets may be incomplete"
            fi
        else
            log_warning "dist/assets directory not found"
        fi
        
        # Check build size
        BUILD_SIZE=$(du -sh dist | cut -f1)
        log_info "Build size: $BUILD_SIZE"
        
    else
        log_error "dist directory not created"
    fi
    
    # Check for build warnings
    if echo "$BUILD_OUTPUT" | grep -q "chunks are larger than"; then
        log_warning "Build has large chunks (>500KB) - consider code splitting"
    fi
else
    log_error "Build failed with exit code $BUILD_EXIT_CODE"
fi

# 7. Check GitHub Actions workflow
log_section "7. Checking GitHub Actions Workflow"
WORKFLOW_FILE=".github/workflows/release.yml"

if [ -f "$WORKFLOW_FILE" ]; then
    log_success "GitHub Actions workflow file exists"
    
    # Check for required jobs
    if grep -q "jobs:" "$WORKFLOW_FILE"; then
        log_success "Workflow contains jobs"
    else
        log_error "Workflow does not contain jobs"
    fi
    
    # Check for Node.js setup
    if grep -q "setup-node" "$WORKFLOW_FILE"; then
        log_success "Workflow includes Node.js setup"
        
        # Check Node.js version in workflow
        if grep -q "node-version.*20" "$WORKFLOW_FILE"; then
            log_success "Workflow uses Node.js version 20"
        else
            log_warning "Workflow Node.js version may not match (expected: 20)"
        fi
    else
        log_warning "Workflow does not include setup-node action"
    fi
    
    # Check for npm ci
    if grep -q "npm ci" "$WORKFLOW_FILE"; then
        log_success "Workflow uses npm ci (recommended)"
    else
        log_warning "Workflow does not use npm ci"
    fi
    
    # Check for build step
    if grep -q "npm run build\|electron:build" "$WORKFLOW_FILE"; then
        log_success "Workflow includes build step"
    else
        log_error "Workflow does not include build step"
    fi
else
    log_error "GitHub Actions workflow file not found at $WORKFLOW_FILE"
fi

# 8. Check git status
log_section "8. Checking Git Status"
if command -v git &> /dev/null; then
    if [ -d ".git" ]; then
        log_success "Git repository detected"
        
        # Check for uncommitted changes
        if git diff --quiet; then
            log_success "No uncommitted changes"
        else
            log_warning "Uncommitted changes detected"
            echo ""
            git status --short
            echo ""
        fi
        
        # Check current branch
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        log_info "Current branch: $CURRENT_BRANCH"
    else
        log_warning "Not in a git repository"
    fi
else
    log_warning "Git is not installed"
fi

# 9. Final summary
log_section "Verification Summary"
echo ""
echo -e "${GREEN}Tests Passed:    $PASSED${NC}"
echo -e "${YELLOW}Warnings:        $WARNINGS${NC}"
echo -e "${RED}Tests Failed:    $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    log_success "Build verification completed successfully!"
    echo ""
    log_info "Your project is ready to:"
    echo "  • Commit and push to GitHub"
    echo "  • Trigger GitHub Actions workflow"
    echo "  • Deploy successfully"
    echo ""
    exit 0
else
    log_error "Build verification failed!"
    echo ""
    log_info "Please fix the errors above before pushing to GitHub"
    echo ""
    exit 1
fi
