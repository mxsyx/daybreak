# Rust WebAssembly AVL Interval Tree Build Guide

## 🛠️ Environment Setup

### 1. Install Rust

```bash
# If you haven't installed Rust yet
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### 2. Install WebAssembly Toolchain

```bash
# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Install wasm-pack (recommended method)
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Or install using cargo
cargo install wasm-pack
```

### 3. Verify Tool Installation

```bash
wasm-pack --version
```

## 📁 Project Structure Setup

Create project directory structure:

```
avl-interval-tree-wasm/
├── Cargo.toml
├── src/
│   └── lib.rs
├── index.html
└── pkg/ (generated after compilation)
```

### Step 1: Create Project Directory

```bash
mkdir avl-interval-tree-wasm
cd avl-interval-tree-wasm
mkdir src
```

### Step 2: Create Cargo.toml

Save the provided `Cargo.toml` content to the project root directory.

### Step 3: Create src/lib.rs

Save the provided Rust code as `src/lib.rs`.

### Step 4: Create index.html

Save the provided HTML code as `index.html`.

## 🔨 Compilation Process

### Method 1: Using wasm-pack (Recommended)

```bash
# Execute in project root directory
wasm-pack build --target web --out-dir pkg

# Or generate npm package
wasm-pack build --target bundler --out-dir pkg
```

### Method 2: Direct Compilation with cargo

```bash
# Compile to WebAssembly
cargo build --target wasm32-unknown-unknown --release

# Generated file located at:
# target/wasm32-unknown-unknown/release/avl_interval_tree_wasm.wasm
```

## 📦 Compilation Options Explanation

### wasm-pack Target Options:

- `--target web`: Generates modules that can be used directly in browsers
- `--target bundler`: Generates modules for bundling tools
- `--target nodejs`: Generates modules for Node.js

### Optimization Options:

```bash
# Release version (optimized for size and performance)
wasm-pack build --target web --release

# Development version (includes debug information)
wasm-pack build --target web --dev
```

## 🐛 Common Troubleshooting

### Issue 1: wasm-pack command not found

```bash
# Reinstall wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
# or
cargo install wasm-pack
```

### Issue 2: Compilation error "linking with `rust-lld` failed"

```bash
# Update Rust toolchain
rustup update
rustup target add wasm32-unknown-unknown
```
