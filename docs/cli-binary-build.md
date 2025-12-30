# brenner CLI: Building & Distributing the Binary

> **Goal**: Future-self can reproduce the `brenner` binary from source.

---

## Quick Reference

```bash
# Build for current platform
bun build --compile --minify --outfile dist/brenner ./brenner.ts

# Build with version metadata (recommended)
BRENNER_VERSION="0.1.0" \
  BRENNER_GIT_SHA="$(git rev-parse HEAD)" \
  BRENNER_BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  BRENNER_TARGET="linux-x64" \
  bun build --compile --minify --env=BRENNER_* \
    --target=bun-linux-x64-baseline --outfile dist/brenner ./brenner.ts

# Verify the build
./dist/brenner --version
./dist/brenner doctor --json --skip-ntm --skip-cass --skip-cm
```

---

## Prerequisites

- **Bun** >= 1.1.0 (see `specs/toolchain.manifest.json` for pinned version)
- Git (for SHA embedding)

```bash
# Install Bun (if needed)
curl -fsSL https://bun.sh/install | bash

# Verify
bun --version
```

---

## Build Targets

Bun supports cross-compilation to these targets:

| Target | Platform | Notes |
|--------|----------|-------|
| `bun-linux-x64-baseline` | Linux x64 | Default for most Linux servers |
| `bun-linux-arm64` | Linux ARM64 | For ARM servers (Graviton, etc.) |
| `bun-darwin-arm64` | macOS ARM | Apple Silicon |
| `bun-darwin-x64` | macOS Intel | Older Macs |
| `bun-windows-x64-baseline` | Windows x64 | Produces `.exe` |

### Build All Platforms

```bash
mkdir -p dist

# Set common metadata
export BRENNER_VERSION="0.1.0"
export BRENNER_GIT_SHA="$(git rev-parse HEAD)"
export BRENNER_BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Linux x64
BRENNER_TARGET="linux-x64" bun build --compile --minify --env=BRENNER_* \
  --target=bun-linux-x64-baseline --outfile dist/brenner-linux-x64 ./brenner.ts

# Linux ARM64
BRENNER_TARGET="linux-arm64" bun build --compile --minify --env=BRENNER_* \
  --target=bun-linux-arm64 --outfile dist/brenner-linux-arm64 ./brenner.ts

# macOS ARM64 (Apple Silicon)
BRENNER_TARGET="darwin-arm64" bun build --compile --minify --env=BRENNER_* \
  --target=bun-darwin-arm64 --outfile dist/brenner-darwin-arm64 ./brenner.ts

# macOS x64 (Intel)
BRENNER_TARGET="darwin-x64" bun build --compile --minify --env=BRENNER_* \
  --target=bun-darwin-x64 --outfile dist/brenner-darwin-x64 ./brenner.ts

# Windows x64
BRENNER_TARGET="win-x64" bun build --compile --minify --env=BRENNER_* \
  --target=bun-windows-x64-baseline --outfile dist/brenner-win-x64.exe ./brenner.ts
```

---

## Version Metadata

The `BRENNER_*` environment variables are embedded at build time:

| Variable | Purpose | Example |
|----------|---------|---------|
| `BRENNER_VERSION` | Semantic version | `0.1.0` |
| `BRENNER_GIT_SHA` | Git commit hash | `abc123def...` |
| `BRENNER_BUILD_DATE` | ISO 8601 timestamp | `2025-12-30T12:00:00Z` |
| `BRENNER_TARGET` | Build target platform | `linux-x64` |

Verify with:
```bash
./dist/brenner --version
```

---

## Checksum Generation

For release artifacts, generate SHA256 checksums:

```bash
cd dist
for f in brenner-*; do
  sha256sum "$f" > "${f}.sha256"
done
```

macOS (uses `shasum`):
```bash
cd dist
for f in brenner-*; do
  shasum -a 256 "$f" > "${f}.sha256"
done
```

---

## Internal Distribution (Pre-Release)

### Option 1: Direct file sharing

```bash
# Share the binary + checksum
scp dist/brenner-linux-x64{,.sha256} user@host:/tmp/

# Install on target
ssh user@host 'chmod +x /tmp/brenner-linux-x64 && sudo mv /tmp/brenner-linux-x64 /usr/local/bin/brenner'
```

### Option 2: Use install.sh with local artifact

```bash
# On target machine
./install.sh \
  --artifact-url "file:///tmp/brenner-linux-x64" \
  --checksum "$(cat /tmp/brenner-linux-x64.sha256 | awk '{print $1}')" \
  --verify
```

### Option 3: CI artifacts

Upload to a GitHub release (even as draft) and use `install.sh` with `--version`:

```bash
curl -fsSL "https://raw.githubusercontent.com/Dicklesworthstone/brenner_bot/v0.1.0/install.sh" \
  | bash -s -- --version "0.1.0" --verify
```

---

## Upgrade Workflow

The installed `brenner` CLI provides upgrade guidance:

```bash
brenner upgrade
brenner upgrade --version 0.2.0
```

This prints the canonical install commands (it doesn't auto-upgrade).

---

## Troubleshooting

See `specs/bootstrap_troubleshooting_v0.1.md` for:
- PATH issues
- Verification failures
- Platform-specific issues (macOS Gatekeeper, ntm/tmux)
- Proxy/network configuration

### Common Issues

**"bun: command not found"**
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc  # or ~/.zshrc
```

**Cross-compilation fails with missing target**
```bash
# Verify Bun supports the target
bun --help | grep -A20 'build.*compile'
```

**Binary works but `--version` shows "unknown"**
- Ensure `--env=BRENNER_*` was passed during build
- Verify environment variables were exported before build

---

## CI Build (Reference)

The GitHub Actions workflow (`.github/workflows/release.yml`) builds all platforms on tag push:

```yaml
# Simplified excerpt
- name: Build binaries
  run: |
    export BRENNER_VERSION="${{ github.ref_name }}"
    export BRENNER_GIT_SHA="${{ github.sha }}"
    export BRENNER_BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

    for target in linux-x64 linux-arm64 darwin-arm64 darwin-x64 win-x64; do
      BRENNER_TARGET="$target" bun build --compile --minify --env=BRENNER_* \
        --target="bun-${target/-baseline/}" \
        --outfile "dist/brenner-${target}" ./brenner.ts
    done
```

---

## Related Docs

- **README.md** → Install commands, CLI command map
- **specs/toolchain.manifest.json** → Pinned tool versions
- **specs/bootstrap_troubleshooting_v0.1.md** → Troubleshooting guide
- **specs/release_artifact_matrix_v0.1.md** → Release artifact naming
