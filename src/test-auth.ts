#!/usr/bin/env node

import { 
    generateSignature, 
    createQueryString, 
    createSignedRequest,
    validateApiCredentials,
    getBaseUrl
} from './utils/auth.js';

console.log('=== Testing Binance MCP Authentication Utilities ===\n');

// Test 1: Generate Signature
console.log('Test 1: Generate Signature');
const testQueryString = 'symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&quantity=1&price=30000&timestamp=1499827319559';
const testSecret = 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j';
const expectedSignature = 'c8db56825ae71d6d79447849e617115f4a920fa2acdcab2b053c4b2838bd6b71';

const signature = generateSignature(testQueryString, testSecret);
console.log('Query String:', testQueryString);
console.log('Generated Signature:', signature);
console.log('Expected Signature:', expectedSignature);
console.log('Test Passed:', signature === expectedSignature);
console.log();

// Test 2: Create Query String
console.log('Test 2: Create Query String');
const params = {
    symbol: 'BTCUSDT',
    side: 'BUY',
    type: 'LIMIT',
    timeInForce: 'GTC',
    quantity: 1,
    price: 30000,
    timestamp: 1499827319559
};
const queryString = createQueryString(params);
console.log('Parameters:', params);
console.log('Generated Query String:', queryString);
console.log('Test Passed:', queryString === testQueryString);
console.log();

// Test 3: Create Signed Request
console.log('Test 3: Create Signed Request');
const signedRequest = createSignedRequest({
    symbol: 'BTCUSDT',
    side: 'BUY',
    type: 'LIMIT'
}, testSecret, 5000);
console.log('Signed Request:', signedRequest);
console.log('Contains signature:', signedRequest.includes('signature='));
console.log('Contains timestamp:', signedRequest.includes('timestamp='));
console.log('Contains recvWindow:', signedRequest.includes('recvWindow=5000'));
console.log();

// Test 4: Validate API Credentials
console.log('Test 4: Validate API Credentials');
console.log('Current environment variables:');
console.log('BINANCE_API_KEY:', process.env.BINANCE_API_KEY ? '***' + process.env.BINANCE_API_KEY.slice(-4) : 'NOT SET');
console.log('BINANCE_SECRET_KEY:', process.env.BINANCE_SECRET_KEY ? '***' + process.env.BINANCE_SECRET_KEY.slice(-4) : 'NOT SET');

try {
    const { apiKey, secretKey } = validateApiCredentials();
    console.log('API credentials validated successfully');
    console.log('API Key (last 4 chars):', apiKey.slice(-4));
} catch (error: any) {
    console.log('API credentials validation failed:', error.message);
}
console.log();

// Test 5: Get Base URL
console.log('Test 5: Get Base URL');
console.log('BINANCE_TESTNET:', process.env.BINANCE_TESTNET);
const baseUrl = getBaseUrl();
console.log('Base URL:', baseUrl);
console.log('Is Testnet:', baseUrl.includes('testnet'));
console.log();

// Test 6: Array Parameters in Query String
console.log('Test 6: Array Parameters in Query String');
const arrayParams = {
    symbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
    type: 'FULL'
};
const arrayQueryString = createQueryString(arrayParams);
console.log('Parameters with array:', arrayParams);
console.log('Generated Query String:', arrayQueryString);
console.log('Contains encoded array:', arrayQueryString.includes('%5B') && arrayQueryString.includes('%5D'));
console.log();

console.log('=== All Tests Completed ===');