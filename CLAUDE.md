# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides AI agents access to Binance cryptocurrency market data and spot trading functionality. The server exposes two categories of tools:

1. **Public Market Data Tools** - No authentication required (prices, order books, candlestick data, etc.)
2. **Authenticated Trading Tools** - Requires Binance API credentials (account info, placing/canceling orders, trade history)

Published as `@luxiaolei/binance-mcp` on npm registry.

## Development Commands

### Build and Run
```bash
npm run build          # Compile TypeScript to dist/
npm run start          # Run compiled server
npm run dev            # Run directly from TypeScript source
npm run demo           # Run demo script (if available)
npm run inspector      # Launch MCP Inspector for debugging
```

### Testing
```bash
npm run test           # Run auth + manual tests
npm run test:auth      # Test authentication utilities
npm run test:manual    # Test direct API integration
npm run typecheck      # TypeScript type checking
npm run lint           # Run linting (uses TypeScript compilation)
npm run verify         # Build and run auth tests (quick verification)
npm run ci             # Full CI pipeline (clean, build, test)
```

### Package Management
```bash
npm install           # Install dependencies
npm run clean         # Remove dist/ directory
npm run prepublishOnly # Build before publishing (auto-triggered)
```

## Core Architecture

### Entry Point (`src/index.ts`)
- Creates MCP server instance
- Registers two sets of tools:
  - Public market data tools (inline registration)
  - Trading tools (via `registerTradingTools`)
- Handles proxy configuration and cleanup

### Authentication System (`src/utils/auth.ts`)
Critical for all trading operations:
- **`generateSignature()`** - HMAC SHA256 signing for API requests
- **`createSignedRequest()`** - Combines parameters, timestamp, and signature
- **`validateApiCredentials()`** - Ensures API keys are present in environment
- **`getBaseUrl()`** - Returns testnet or production URL based on `BINANCE_TESTNET` env var

### Trading Tools (`src/tools/trading.ts`)
Contains 9 authenticated tools that require API key validation:
- Account management (`get_account_info`)
- Order lifecycle (`place_order`, `cancel_order`, `query_order`, `get_open_orders`)
- Order history (`get_order_history`, `get_trade_history`)
- Safety features (`test_order`, `cancel_all_orders`)

All trading tools follow this pattern:
1. Validate API credentials via `validateApiCredentials()`
2. Create signed request via `createSignedRequest()`
3. Make authenticated HTTP request with API key header
4. Return formatted response or error

### Type Definitions (`src/types/trading.ts`)
Defines Binance-specific enums and interfaces:
- Order enums (`OrderSide`, `OrderType`, `TimeInForce`, `OrderStatus`)
- Request/response interfaces (`PlaceOrderParams`, `OrderResponse`, `AccountInfo`)

## Environment Configuration

### Required for Trading Features
- `BINANCE_API_KEY` - Binance API key with spot trading permissions
- `BINANCE_SECRET_KEY` - Binance secret key for request signing
- `BINANCE_TESTNET` - Set to "true" for testnet, omit/false for production

### Optional
- `HTTP_PROXY` / `HTTPS_PROXY` - Proxy configuration for API requests

## Quick Claude Code Setup

Add this MCP server to Claude Code with one command:
```bash
claude mcp add binance --scope user --command npx --args "-y,@luxiaolei/binance-mcp@latest"
```

For trading features, configure API keys:
```bash
claude mcp config binance --env BINANCE_API_KEY=your-api-key BINANCE_SECRET_KEY=your-secret-key BINANCE_TESTNET=false
```

## API Integration Architecture

### Request Flow
1. **Public endpoints** - Direct HTTP calls to Binance API
2. **Authenticated endpoints** - Require signature generation:
   - Parameters → Query string → HMAC SHA256 signature → Signed request
   - Headers include `X-MBX-APIKEY` for authentication
   - Query includes `timestamp`, `recvWindow`, and `signature`

### Base URLs
- Production: `https://api.binance.com`
- Testnet: `https://testnet.binance.vision`

### Error Handling
- API errors returned as `isError: true` with message from Binance
- Authentication errors caught at credential validation level
- Network errors handled by axios with proxy support

## Development Guidelines

### Adding New Trading Tools
1. Define tool in `registerTradingTools()` with Zod schema validation
2. Use `validateApiCredentials()` to get API keys
3. Use `createSignedRequest()` for parameter signing
4. Include proper error handling with Binance error messages
5. Test with both testnet and production environments

### Security Considerations
- Never log or expose API keys/secrets in code
- Use `validateApiCredentials()` to ensure keys are present
- All signed requests include timestamp to prevent replay attacks
- Support testnet for safe development

### Official Documentation
For complete Binance API documentation, refer to:
- [Binance Spot API Documentation](https://binance-docs.github.io/apidocs/spot/en/) - Complete API endpoint documentation
- [API Error Codes](https://binance-docs.github.io/apidocs/spot/en/#error-codes) - Error codes and messages  
- [Testnet Documentation](https://testnet.binance.vision/) - Testnet-specific documentation

## Testing Strategy

### Test Environment Setup
Set these environment variables for testing:
```bash
export BINANCE_TESTNET="true"
export BINANCE_API_KEY="testnet-api-key"
export BINANCE_SECRET_KEY="testnet-secret-key"
```

### Test Categories
- **Authentication tests** (`test:auth`) - Signature generation, credential validation
- **API integration tests** (`test:manual`) - Direct HTTP calls to Binance
- **MCP integration tests** (`test:trading`) - Full MCP client workflow

Use `npm run inspector` to interact with tools via MCP Inspector GUI for manual testing.

## CI/CD Integration

### GitHub Actions Workflows
The project includes comprehensive CI/CD workflows:

- **CI Pipeline** (`ci.yml`) - Runs on Node.js 18.x, 20.x, 22.x
  - TypeScript compilation and type checking
  - Authentication tests without credentials
  - Security audit and sensitive file detection
  - Docker build validation
  - Package installation testing
- **Release Pipeline** - Automated publishing to npm
- **Dependency Updates** - Automated dependency maintenance

### Docker Support
The project includes a multi-stage Dockerfile for containerized deployment:
```bash
docker build -t binance-mcp .          # Build container
docker run -e BINANCE_API_KEY=... binance-mcp  # Run with env vars
```

### Package Testing
Test package installation and npx execution:
```bash
# Test local installation
npm install /path/to/project
# Test npx command
npx @luxiaolei/binance-mcp@latest
```