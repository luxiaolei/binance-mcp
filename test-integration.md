# Binance MCP Trading Integration Test Guide

## Test Results Summary

### ✅ Implementation Completed

1. **Authentication Infrastructure**
   - HMAC SHA256 signature generation implemented
   - Environment variable validation for API keys
   - Support for both mainnet and testnet URLs
   - Request timestamp and recvWindow parameters

2. **Trading Tools Implemented**
   - `get_account_info` - Account information and balances
   - `place_order` - Place new orders (all types)
   - `test_order` - Validate orders without execution
   - `cancel_order` - Cancel existing orders
   - `cancel_all_orders` - Cancel all orders for a symbol
   - `query_order` - Query order status
   - `get_open_orders` - List open orders
   - `get_order_history` - Get historical orders
   - `get_trade_history` - Get executed trades

3. **Build Status**
   - TypeScript compilation: ✅ Successful
   - No build errors
   - All types properly defined

## Manual Testing Instructions

### 1. Test Public Endpoints (No API Key Required)

```bash
# Test market data endpoints
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_price",
      "arguments": {
        "symbol": "BTCUSDT"
      }
    },
    "id": 1
  }'
```

### 2. Configure API Credentials

For testing with real trading features:

```bash
# Set environment variables
export BINANCE_API_KEY="your-api-key"
export BINANCE_SECRET_KEY="your-secret-key"
export BINANCE_TESTNET="true"  # Use testnet for safety
```

Or add to your MCP configuration:

```json
{
  "mcpServers": {
    "binance": {
      "command": "node",
      "args": ["/path/to/binance-mcp/dist/index.js"],
      "env": {
        "BINANCE_API_KEY": "your-api-key",
        "BINANCE_SECRET_KEY": "your-secret-key",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

### 3. Test Trading Endpoints

#### Get Account Info
```bash
# Via MCP client
{
  "tool": "get_account_info",
  "arguments": {}
}
```

#### Place Test Order
```bash
# Via MCP client
{
  "tool": "test_order",
  "arguments": {
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": 0.001,
    "price": 30000
  }
}
```

#### Place Real Order (Use Testnet!)
```bash
# Via MCP client
{
  "tool": "place_order",
  "arguments": {
    "symbol": "BTCUSDT",
    "side": "BUY",
    "type": "LIMIT",
    "timeInForce": "GTC",
    "quantity": 0.001,
    "price": 30000
  }
}
```

## Using with Claude Desktop or Cursor

1. Build the project:
   ```bash
   npm run build
   ```

2. Add to your MCP configuration file:
   - Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Cursor: Project `.cursor/mcp.json`

3. Configuration example:
   ```json
   {
     "mcpServers": {
       "binance": {
         "command": "node",
         "args": ["/absolute/path/to/binance-mcp/dist/index.js"],
         "env": {
           "BINANCE_API_KEY": "your-api-key",
           "BINANCE_SECRET_KEY": "your-secret-key",
           "BINANCE_TESTNET": "true"
         }
       }
     }
   }
   ```

4. Restart Claude Desktop or reload Cursor

5. The tools will be available to the AI assistant

## Security Best Practices

1. **Use Testnet for Testing**
   - Set `BINANCE_TESTNET=true`
   - Get testnet API keys from https://testnet.binance.vision/

2. **API Key Restrictions**
   - Enable IP whitelist on Binance
   - Only grant necessary permissions (spot trading)
   - Never share your secret key

3. **Environment Variables**
   - Never commit API keys to version control
   - Use environment variables or secure vaults
   - Rotate keys regularly

## Troubleshooting

### Connection Issues
- Check if you're behind a proxy (set HTTP_PROXY/HTTPS_PROXY)
- Verify API endpoints are accessible
- Check network connectivity

### Authentication Errors
- Verify API key and secret are correct
- Check if API key has trading permissions
- Ensure system time is synchronized (for timestamp)
- Verify IP whitelist if enabled

### Order Errors
- Check minimum order sizes for the symbol
- Verify account has sufficient balance
- Ensure price is within valid range
- Check if symbol is valid and active

## Next Steps

1. **Testing**
   - Use Binance Testnet for safe testing
   - Test all order types and edge cases
   - Verify error handling

2. **Monitoring**
   - Implement rate limit tracking
   - Add logging for debugging
   - Monitor order execution

3. **Enhancements**
   - Add WebSocket support for real-time data
   - Implement OCO and other advanced order types
   - Add portfolio analytics tools