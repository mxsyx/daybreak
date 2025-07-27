#!/bin/bash

# AVL Interval Tree WebAssembly Automated Build Script
# Usage: chmod +x build.sh && ./build.sh

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

echo "🚀 AVL Interval Tree WebAssembly Build Script"
echo "=============================================="

# Check if Rust is installed
print_step "Checking Rust environment..."
if ! command -v rustc &> /dev/null; then
    print_error "Rust is not installed. Please install Rust first:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

RUST_VERSION=$(rustc --version)
print_success "Rust is installed: $RUST_VERSION"

# Check if wasm32 target is installed
print_step "Checking WebAssembly target..."
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
    print_warning "WebAssembly target not installed, installing now..."
    rustup target add wasm32-unknown-unknown
    print_success "WebAssembly target installation completed"
else
    print_success "WebAssembly target is already installed"
fi

# Check if wasm-pack is installed
print_step "Checking wasm-pack..."
if ! command -v wasm-pack &> /dev/null; then
    print_warning "wasm-pack not installed, installing now..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
    
    # Reload PATH
    export PATH="$HOME/.cargo/bin:$PATH"
    
    if ! command -v wasm-pack &> /dev/null; then
        print_error "wasm-pack installation failed, please install manually"
        exit 1
    fi
    print_success "wasm-pack installation completed"
else
    WASM_PACK_VERSION=$(wasm-pack --version)
    print_success "wasm-pack is installed: $WASM_PACK_VERSION"
fi

# Check project files
print_step "Checking project files..."
required_files=("Cargo.toml" "src/lib.rs")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Missing required file: $file"
        exit 1
    fi
done
print_success "Project files check passed"

# Clean previous builds
print_step "Cleaning previous build artifacts..."
if [ -d "pkg" ]; then
    rm -rf pkg
    print_info "Deleted pkg/ directory"
fi

if [ -d "target" ]; then
    cargo clean
    print_info "Cleaned target/ directory"
fi

# Build WebAssembly
print_step "Starting WebAssembly build..."
echo "Build command: wasm-pack build --target web --release --out-dir pkg"

if wasm-pack build --target web --release --out-dir pkg; then
    print_success "WebAssembly build successful!"
else
    print_error "WebAssembly build failed"
    exit 1
fi

# Check build artifacts
print_step "Checking build artifacts..."
if [ -d "pkg" ]; then
    print_success "pkg/ directory generated"
    echo "Build artifacts:"
    ls -la pkg/
    
    # Check key files
    key_files=("avl_interval_tree_wasm.js" "avl_interval_tree_wasm_bg.wasm" "package.json")
    for file in "${key_files[@]}"; do
        if [ -f "pkg/$file" ]; then
            print_success "✓ $file"
        else
            print_warning "✗ $file not found"
        fi
    done
else
    print_error "pkg/ directory not generated"
    exit 1
fi

# Get WebAssembly file size
if [ -f "pkg/avl_interval_tree_wasm_bg.wasm" ]; then
    wasm_size=$(stat -f%z "pkg/avl_interval_tree_wasm_bg.wasm" 2>/dev/null || stat -c%s "pkg/avl_interval_tree_wasm_bg.wasm" 2>/dev/null || echo "unknown")
    print_info "WebAssembly file size: $wasm_size bytes"
fi

# Provide usage instructions
echo ""
echo "🎉 Build completed!"
