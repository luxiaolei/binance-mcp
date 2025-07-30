#!/usr/bin/env node

import axios from 'axios';
import { 
    generateSignature, 
    createQueryString, 
    createSignedRequest,
    getBaseUrl
} from './utils/auth.js';

console.log('=== Manual Testing of Binance API Integration ===\n');

const apiKey = process.env.BINANCE_API_KEY || '';
const secretKey = process.env.BINANCE_SECRET_KEY || '';
const baseUrl = getBaseUrl();

console.log('Configuration:');
console.log('Base URL:', baseUrl);
console.log('API Key:', apiKey ? `***${apiKey.slice(-4)}` : 'NOT SET');
console.log('Secret Key:', secretKey ? `***${secretKey.slice(-4)}` : 'NOT SET');
console.log('Testnet Mode:', process.env.BINANCE_TESTNET === 'true' ? 'YES' : 'NO');
console.log();

async function testPublicEndpoints() {
    console.log('=== Testing Public Endpoints (No Auth Required) ===\n');
    
    // Test 1: Get Price
    try {
        console.log('1. Testing Price Endpoint...');
        const response = await axios.get(`${baseUrl}/api/v3/ticker/price`, {
            params: { symbol: 'BTCUSDT' }
        });
        console.log('✅ Success! BTC Price:', response.data.price);
    } catch (error: any) {
        console.log('❌ Failed:', error.response?.data?.msg || error.message);
    }
    
    // Test 2: Get 24hr Ticker
    try {
        console.log('\n2. Testing 24hr Ticker...');
        const response = await axios.get(`${baseUrl}/api/v3/ticker/24hr`, {
            params: { symbol: 'ETHUSDT' }
        });
        console.log('✅ Success!');
        console.log('   Symbol:', response.data.symbol);
        console.log('   Price:', response.data.lastPrice);
        console.log('   24h Change:', response.data.priceChangePercent + '%');
    } catch (error: any) {
        console.log('❌ Failed:', error.response?.data?.msg || error.message);
    }
    
    // Test 3: Get Order Book
    try {
        console.log('\n3. Testing Order Book...');
        const response = await axios.get(`${baseUrl}/api/v3/depth`, {
            params: { symbol: 'BNBUSDT', limit: 5 }
        });
        console.log('✅ Success!');
        console.log('   Best Bid:', response.data.bids[0]);
        console.log('   Best Ask:', response.data.asks[0]);
    } catch (error: any) {
        console.log('❌ Failed:', error.response?.data?.msg || error.message);
    }
}

async function testAuthenticatedEndpoints() {
    if (!apiKey || !secretKey) {
        console.log('\n=== Skipping Authenticated Endpoints (No API Keys) ===');
        console.log('To test authenticated endpoints, set:');
        console.log('- BINANCE_API_KEY');
        console.log('- BINANCE_SECRET_KEY');
        console.log('- BINANCE_TESTNET=true (for testnet)');
        return;
    }
    
    console.log('\n=== Testing Authenticated Endpoints ===\n');
    
    // Test 1: Account Info
    try {
        console.log('1. Testing Account Info...');
        const queryString = createSignedRequest({}, secretKey);
        const response = await axios.get(
            `${baseUrl}/api/v3/account?${queryString}`,
            {
                headers: { 'X-MBX-APIKEY': apiKey }
            }
        );
        console.log('✅ Success!');
        console.log('   Can Trade:', response.data.canTrade);
        console.log('   Account Type:', response.data.accountType);
        const nonZeroBalances = response.data.balances.filter(
            (b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
        );
        console.log('   Non-zero Balances:', nonZeroBalances.length);
        nonZeroBalances.slice(0, 3).forEach((balance: any) => {
            console.log(`   - ${balance.asset}: ${balance.free} (free) + ${balance.locked} (locked)`);
        });
    } catch (error: any) {
        console.log('❌ Failed:', error.response?.data?.msg || error.message);
        if (error.response?.status === 401) {
            console.log('   Check your API key permissions and IP whitelist');
        }
    }
    
    // Test 2: Test Order
    try {
        console.log('\n2. Testing Order Validation...');
        const orderParams = {
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            timeInForce: 'GTC',
            quantity: 0.001,
            price: 20000  // Low price to ensure it won't execute
        };
        const queryString = createSignedRequest(orderParams, secretKey);
        const response = await axios.post(
            `${baseUrl}/api/v3/order/test?${queryString}`,
            null,
            {
                headers: { 'X-MBX-APIKEY': apiKey }
            }
        );
        console.log('✅ Order validation successful!');
        console.log('   Order parameters are valid');
    } catch (error: any) {
        console.log('❌ Failed:', error.response?.data?.msg || error.message);
    }
    
    // Test 3: Get Open Orders
    try {
        console.log('\n3. Testing Get Open Orders...');
        const queryString = createSignedRequest({}, secretKey);
        const response = await axios.get(
            `${baseUrl}/api/v3/openOrders?${queryString}`,
            {
                headers: { 'X-MBX-APIKEY': apiKey }
            }
        );
        console.log('✅ Success!');
        console.log('   Open Orders:', response.data.length);
        if (response.data.length > 0) {
            console.log('   First Order:', {
                symbol: response.data[0].symbol,
                side: response.data[0].side,
                price: response.data[0].price,
                status: response.data[0].status
            });
        }
    } catch (error: any) {
        console.log('❌ Failed:', error.response?.data?.msg || error.message);
    }
}

async function runTests() {
    await testPublicEndpoints();
    await testAuthenticatedEndpoints();
    
    console.log('\n=== Test Complete ===');
    console.log('\nTo test with real API keys:');
    console.log('1. Get API keys from Binance or Binance Testnet');
    console.log('2. Set environment variables:');
    console.log('   export BINANCE_API_KEY="your-api-key"');
    console.log('   export BINANCE_SECRET_KEY="your-secret-key"');
    console.log('   export BINANCE_TESTNET="true"  # for testnet');
    console.log('3. Run this test again');
}

runTests().catch(console.error);