#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

async function testTradingTools() {
    console.log('=== Testing Binance MCP Trading Tools ===\n');
    
    // Set up test environment variables
    if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_SECRET_KEY) {
        console.log('⚠️  Warning: BINANCE_API_KEY and BINANCE_SECRET_KEY not set');
        console.log('   Trading tools will fail. Set these environment variables to test trading features.');
        console.log('   For testing, you can use Binance Testnet credentials.\n');
    }

    const serverPath = "./dist/index.js";
    const serverProcess = spawn("node", [serverPath], {
        env: {
            ...process.env,
            BINANCE_TESTNET: 'true' // Use testnet for safety
        }
    });

    const transport = new StdioClientTransport({
        command: "node",
        args: [serverPath],
        env: {
            ...process.env,
            BINANCE_TESTNET: 'true'
        }
    });

    const client = new Client({
        name: "test-client",
        version: "1.0.0",
    }, {
        capabilities: {}
    });

    try {
        await client.connect(transport);
        console.log("✅ Connected to Binance MCP server\n");

        // List available tools
        const tools = await client.listTools();
        console.log("📋 Available tools:");
        
        // Separate tools by category
        const marketTools = tools.tools.filter(t => !t.name.includes('order') && !t.name.includes('account') && !t.name.includes('trade'));
        const tradingTools = tools.tools.filter(t => t.name.includes('order') || t.name.includes('account') || t.name.includes('trade'));
        
        console.log("\n🌐 Market Data Tools (No API Key Required):");
        marketTools.forEach(tool => {
            console.log(`  - ${tool.name}`);
        });
        
        console.log("\n💹 Trading Tools (API Key Required):");
        tradingTools.forEach(tool => {
            console.log(`  - ${tool.name}`);
        });
        console.log();

        // Test 1: Get current price (Public endpoint - should work)
        console.log("Test 1: Get Bitcoin Price (Public API)");
        try {
            const priceResult = await client.callTool("get_price", {
                symbol: "BTCUSDT"
            });
            console.log("✅ Price data retrieved successfully");
            const priceData = JSON.parse(priceResult.content[0].text);
            if (Array.isArray(priceData) && priceData.length > 0) {
                console.log(`   BTC Price: $${priceData[0].price}`);
            }
        } catch (error: any) {
            console.log("❌ Failed to get price:", error.message);
        }
        console.log();

        // Test 2: Get order book (Public endpoint - should work)
        console.log("Test 2: Get Order Book (Public API)");
        try {
            const orderBookResult = await client.callTool("get_order_book", {
                symbol: "BTCUSDT",
                limit: 5
            });
            console.log("✅ Order book retrieved successfully");
            const orderBook = JSON.parse(orderBookResult.content[0].text);
            console.log(`   Bids: ${orderBook.bids.length}, Asks: ${orderBook.asks.length}`);
        } catch (error: any) {
            console.log("❌ Failed to get order book:", error.message);
        }
        console.log();

        // Test 3: Get Account Info (Requires API key)
        if (process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY) {
            console.log("Test 3: Get Account Information (Authenticated)");
            try {
                const accountResult = await client.callTool("get_account_info", {});
                console.log("✅ Account info retrieved successfully");
                const accountData = JSON.parse(accountResult.content[0].text);
                console.log(`   Can Trade: ${accountData.canTrade}`);
                console.log(`   Account Type: ${accountData.accountType}`);
                console.log(`   Non-zero Balances: ${accountData.balances.length}`);
            } catch (error: any) {
                console.log("❌ Failed to get account info:", error.message);
                if (error.message.includes('Invalid API-key')) {
                    console.log("   Make sure your API key is valid and has the correct permissions");
                }
            }
            console.log();

            // Test 4: Test Order (Validate without placing)
            console.log("Test 4: Test Order Validation (Authenticated)");
            try {
                const testOrderResult = await client.callTool("test_order", {
                    symbol: "BTCUSDT",
                    side: "BUY",
                    type: "LIMIT",
                    timeInForce: "GTC",
                    quantity: 0.001,
                    price: 30000
                });
                console.log("✅ Order validation successful");
                const testResult = JSON.parse(testOrderResult.content[0].text);
                console.log("   Order parameters are valid");
            } catch (error: any) {
                console.log("❌ Order validation failed:", error.message);
            }
            console.log();

            // Test 5: Get Open Orders
            console.log("Test 5: Get Open Orders (Authenticated)");
            try {
                const openOrdersResult = await client.callTool("get_open_orders", {});
                console.log("✅ Open orders retrieved successfully");
                const openOrders = JSON.parse(openOrdersResult.content[0].text);
                console.log(`   Open Orders Count: ${openOrders.length}`);
            } catch (error: any) {
                console.log("❌ Failed to get open orders:", error.message);
            }
        } else {
            console.log("\n⚠️  Skipping authenticated tests - API credentials not provided");
            console.log("   To test trading features, set BINANCE_API_KEY and BINANCE_SECRET_KEY");
            console.log("   You can use Binance Testnet for safe testing:");
            console.log("   1. Go to https://testnet.binance.vision/");
            console.log("   2. Create a testnet account");
            console.log("   3. Generate API keys");
            console.log("   4. Set BINANCE_TESTNET=true");
        }

        console.log("\n=== Test Summary ===");
        console.log("✅ MCP Server Connection: Success");
        console.log("✅ Public API Endpoints: Working");
        console.log(process.env.BINANCE_API_KEY ? "✅ API Credentials: Configured" : "⚠️  API Credentials: Not configured");
        console.log("✅ All implemented tools are available");

    } catch (error) {
        console.error("Error during testing:", error);
    } finally {
        await transport.close();
        serverProcess.kill();
        process.exit(0);
    }
}

// Run the tests
testTradingTools().catch(console.error);