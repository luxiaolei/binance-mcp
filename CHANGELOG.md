# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive CI/CD pipeline with GitHub Actions
- Automated testing for authentication utilities
- Security scanning and dependency audit
- Multi-platform testing (Node.js 18, 20, 22)
- Automated dependency updates
- Package installation verification
- Docker build testing

### Changed
- Enhanced package.json with additional CI scripts
- Updated .gitignore with additional security patterns
- Improved error handling and validation

## [1.0.1] - 2024-XX-XX

### Added
- Complete spot trading functionality
- 9 authenticated trading tools
- Account management endpoints
- Order lifecycle management
- Trading history and analytics
- Comprehensive authentication system with HMAC SHA256 signing
- Support for both mainnet and testnet environments
- Proxy configuration support
- Type definitions for all trading operations

### Security
- Secure API key management via environment variables
- Request signing with timestamp validation
- Protection against replay attacks
- Comprehensive input validation

## [1.0.0] - 2024-XX-XX

### Added
- Initial release with public market data endpoints
- 11 public API tools for market data
- Price information and ticker data
- Order book and trade history
- Candlestick (K-line) data
- MCP server implementation
- TypeScript support
- Proxy configuration