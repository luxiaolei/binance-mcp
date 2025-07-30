import crypto from 'crypto';

interface SignedRequestParams {
    [key: string]: any;
}

/**
 * Generate HMAC SHA256 signature for Binance API requests
 */
export function generateSignature(queryString: string, secretKey: string): string {
    return crypto
        .createHmac('sha256', secretKey)
        .update(queryString)
        .digest('hex');
}

/**
 * Create query string from parameters object
 */
export function createQueryString(params: SignedRequestParams): string {
    // Don't sort the keys - preserve order for signature compatibility
    return Object.keys(params)
        .map(key => {
            const value = params[key];
            if (Array.isArray(value)) {
                return `${key}=${JSON.stringify(value)}`;
            }
            return `${key}=${value}`;
        })
        .join('&');
}

/**
 * Create signed request parameters for authenticated endpoints
 */
export function createSignedRequest(
    params: SignedRequestParams, 
    secretKey: string,
    recvWindow: number = 5000
): string {
    // Add timestamp and recvWindow if not present
    const signedParams = {
        ...params,
        recvWindow,
        timestamp: Date.now()
    };
    
    // Create query string
    const queryString = createQueryString(signedParams);
    
    // Generate signature
    const signature = generateSignature(queryString, secretKey);
    
    return `${queryString}&signature=${signature}`;
}

/**
 * Validate required environment variables
 */
export function validateApiCredentials(): { apiKey: string; secretKey: string } {
    const apiKey = process.env.BINANCE_API_KEY;
    const secretKey = process.env.BINANCE_SECRET_KEY;
    
    if (!apiKey || !secretKey) {
        throw new Error(
            'Missing required environment variables: BINANCE_API_KEY and/or BINANCE_SECRET_KEY. ' +
            'Please add these to your MCP configuration.'
        );
    }
    
    return { apiKey, secretKey };
}

/**
 * Get base URL for API requests
 */
export function getBaseUrl(): string {
    const isTestnet = process.env.BINANCE_TESTNET === 'true';
    return isTestnet 
        ? 'https://testnet.binance.vision'
        : 'https://api.binance.com';
}