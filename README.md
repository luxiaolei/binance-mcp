# Binance Cryptocurrency MCP
[![smithery badge](https://smithery.ai/badge/@snjyor/binance-mcp-data)](https://smithery.ai/server/@snjyor/binance-mcp-data)

<a href="https://glama.ai/mcp/servers/@snjyor/binance-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@snjyor/binance-mcp/badge" alt="Binance Cryptocurrency MCP server" />
</a>

[Model Context Protocol](https://modelcontextprotocol.io) service for accessing Binance cryptocurrency market data and executing spot trading operations.

## Overview

This MCP service allows AI agents (such as Claude, Cursor, Windsurf, etc.) to execute Binance API calls and obtain real-time data from the cryptocurrency market, including prices, candlestick charts, order books, and now also execute trading operations on Binance spot markets.

**Purpose**
You can directly ask AI about the latest cryptocurrency prices, trading volume, price trends, and execute trades without having to check the Binance website or use other tools.

**Available Features**

Through this MCP service, you can:

**Market Data (No API Key Required)**
- Current price information - Get real-time prices for specified cryptocurrencies
- Order book data - View buy and sell order depth
- Candlestick chart data - Obtain candlestick data for different time periods
- 24-hour price changes - View price changes within 24 hours
- Trading history - View recent trading records
- Price statistics - Get price statistics for various time windows

**Trading Operations (API Key Required)**
- Account information - View balances and trading permissions
- Place orders - Execute buy/sell orders (LIMIT, MARKET, etc.)
- Cancel orders - Cancel existing orders
- Query orders - Check order status and details
- View open orders - List all active orders
- Order history - View past orders
- Trade history - View executed trades

## Available Tools

### Market Data Tools (Public)

| Tool                       | Description                                    |
| -------------------------- | ----------------------------------------------- |
| `get_price`                | Get current price for specified cryptocurrency  |
| `get_order_book`           | Get order book data                            |
| `get_recent_trades`        | Get list of recent trades                      |
| `get_historical_trades`    | Get historical trade data                      |
| `get_aggregate_trades`     | Get list of aggregate trades                   |
| `get_klines`               | Get K-line/candlestick data                    |
| `get_ui_klines`            | Get UI-optimized K-line data                   |
| `get_avg_price`            | Get current average price                      |
| `get_24hr_ticker`          | Get 24-hour price change statistics            |
| `get_trading_day_ticker`   | Get trading day market information             |
| `get_book_ticker`          | Get order book ticker                          |
| `get_rolling_window_ticker` | Get rolling window price change statistics    |

### Trading Tools (Requires API Key)

| Tool                 | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `get_account_info`   | Get account balances and trading permissions          |
| `place_order`        | Place a new buy/sell order                           |
| `test_order`         | Test order placement without execution                |
| `cancel_order`       | Cancel an existing order                              |
| `cancel_all_orders`  | Cancel all open orders for a symbol                   |
| `query_order`        | Query status of a specific order                     |
| `get_open_orders`    | Get list of all open orders                          |
| `get_order_history`  | Get historical orders                                 |
| `get_trade_history`  | Get executed trade history                            |

## API Key Configuration

To use trading features, you need to configure your Binance API credentials:

1. **Get API Keys from Binance**
   - Log in to your Binance account
   - Go to API Management
   - Create a new API key with spot trading permissions
   - Save your API Key and Secret Key securely

2. **Configure in MCP**
   Add your API credentials to the MCP configuration:

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": ["-y", "@luxiaolei/binance-mcp@latest"],
      "env": {
        "BINANCE_API_KEY": "your-api-key-here",
        "BINANCE_SECRET_KEY": "your-secret-key-here",
        "BINANCE_TESTNET": "false"
      }
    }
  }
}
```

**Security Notes:**
- Never share your API keys
- Use API restrictions on Binance (IP whitelist, trading permissions only)
- Consider using testnet for testing (set `BINANCE_TESTNET: "true"`)

## Quick Setup for Claude Code

**One-Line Command Setup:**
```bash
claude mcp add binance --scope user --command npx --args "-y,@luxiaolei/binance-mcp@latest"
```

Then set your API keys (optional, for trading features):
```bash
# For trading features, add your API credentials:
claude mcp config binance --env BINANCE_API_KEY=your-api-key-here BINANCE_SECRET_KEY=your-secret-key-here BINANCE_TESTNET=false
```

After setup, restart Claude Code and the Binance tools will be available.

## Using in Cursor

**Global Installation**

Use npx to run the MCP service:

```bash
npx -y @luxiaolei/binance-mcp@latest
```

In Cursor IDE:

1. Go to `Cursor Settings` > `MCP`
2. Click `+ Add New MCP Service`
3. Fill in the form:
   - Name: `binance`
   - Type: `command`
   - Command: `npx -y @luxiaolei/binance-mcp@latest`
4. Add environment variables for trading (optional):
   - BINANCE_API_KEY
   - BINANCE_SECRET_KEY
   - BINANCE_TESTNET

**Project Installation**

Add a `.cursor/mcp.json` file to your project:

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": [
        "-y",
        "@luxiaolei/binance-mcp@latest"
      ],
      "env": {
        "BINANCE_API_KEY": "your-api-key-here",
        "BINANCE_SECRET_KEY": "your-secret-key-here"
      }
    }
  }
}
```

## Usage Examples

### Market Data Examples

**Query Bitcoin Price**
```
Please tell me the current price of Bitcoin
```

**View Ethereum's 24-hour Price Movement**
```
How has Ethereum's price changed in the past 24 hours?
```

**Get BNB's K-line Data**
```
Show me the daily K-line data for BNB over the last 5 days
```

### Trading Examples

**Check Account Balance**
```
Show me my Binance account balance
```

**Place a Limit Buy Order**
```
Place a limit buy order for 0.001 BTC at $65,000
```

**Place a Market Sell Order**
```
Sell 100 USDT worth of ETH at market price
```

**Cancel an Order**
```
Cancel order ID 12345 for BTCUSDT
```

**View Open Orders**
```
Show me all my open orders
```

## Order Types Supported

- **LIMIT** - Buy/sell at a specific price
- **MARKET** - Buy/sell at current market price
- **STOP_LOSS** - Trigger market order when stop price is reached
- **STOP_LOSS_LIMIT** - Trigger limit order when stop price is reached
- **TAKE_PROFIT** - Take profit at target price
- **TAKE_PROFIT_LIMIT** - Take profit with limit order
- **LIMIT_MAKER** - Post-only limit order

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Local testing
npm run start
```

## Debugging Server

To debug your server, you can use [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

First build the server

```
npm run build
```

Run the following command in terminal:

```
# Start MCP Inspector and server
npx @modelcontextprotocol/inspector node dist/index.js
```

## Safety Features

- Request signing with HMAC SHA256
- Timestamp validation to prevent replay attacks
- Support for testnet trading
- Clear error messages for failed operations
- Non-zero balance filtering in account info

## Limitations

- Currently supports only Binance Spot trading
- Futures, Options, and other derivatives are not yet supported
- WebSocket streaming is not implemented
- Advanced order types (OCO, OTOCO) are not yet implemented

## License

[Apache 2.0](LICENSE) 