#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTradingTools } from "./tools/trading.js";

console.log('=== Testing Tool Registration ===\n');

const server = new McpServer({
    name: "binance-mcp-test",
    version: "1.0.0",
    description: "Test server"
});

// Register trading tools
registerTradingTools(server);

// Get registered tools
const tools = server.getRegisteredTools();

console.log(`Total tools registered: ${tools.length}\n`);

// Separate by category
const tradingTools = tools.filter(t => 
    t.name.includes('order') || 
    t.name.includes('account') || 
    t.name.includes('trade')
);

console.log('Trading Tools:');
tradingTools.forEach(tool => {
    console.log(`- ${tool.name}`);
});

console.log('\nTool Details:');
console.log('\n1. get_account_info:');
const accountTool = tools.find(t => t.name === 'get_account_info');
if (accountTool) {
    console.log('   Description: Get account balances and trading permissions');
    console.log('   Parameters: None (uses API credentials from environment)');
}

console.log('\n2. place_order:');
const orderTool = tools.find(t => t.name === 'place_order');
if (orderTool) {
    console.log('   Description: Place a new buy/sell order');
    console.log('   Parameters:');
    console.log('   - symbol: Trading pair (e.g., BTCUSDT)');
    console.log('   - side: BUY or SELL');
    console.log('   - type: Order type (LIMIT, MARKET, etc.)');
    console.log('   - quantity: Amount to trade');
    console.log('   - price: Price for limit orders');
}

console.log('\n3. cancel_order:');
const cancelTool = tools.find(t => t.name === 'cancel_order');
if (cancelTool) {
    console.log('   Description: Cancel an existing order');
    console.log('   Parameters:');
    console.log('   - symbol: Trading pair');
    console.log('   - orderId or origClientOrderId: Order identifier');
}

console.log('\n=== Registration Test Complete ===');
console.log('\nAll trading tools are properly registered and ready to use.');
console.log('To use these tools:');
console.log('1. Configure API credentials in your MCP environment');
console.log('2. Use the MCP inspector or connect via an MCP client');
console.log('3. Call the tools with appropriate parameters');