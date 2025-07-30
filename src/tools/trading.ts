import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import { 
    validateApiCredentials, 
    createSignedRequest, 
    getBaseUrl 
} from "../utils/auth.js";
import { 
    OrderSide, 
    OrderType, 
    TimeInForce, 
    OrderResponseType,
    PlaceOrderParams,
    OrderResponse,
    AccountInfo
} from "../types/trading.js";

const proxyURL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

function getProxy(): any {
    const proxy: any = {};
    if (proxyURL) {
        const urlInfo = new URL(proxyURL);
        proxy.host = urlInfo.hostname;
        proxy.port = urlInfo.port;
        proxy.protocol = urlInfo.protocol.replace(":", "");
    }
    return proxy;
}

export function registerTradingTools(server: McpServer) {
    // Account Information
    server.tool(
        "get_account_info",
        {},
        async () => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                const queryString = createSignedRequest({}, secretKey);
                
                const response = await axios.get<AccountInfo>(
                    `${baseUrl}/api/v3/account?${queryString}`,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                // Format balances to only show non-zero balances
                const nonZeroBalances = response.data.balances.filter(
                    balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
                );
                
                const formattedResponse = {
                    ...response.data,
                    balances: nonZeroBalances
                };
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(formattedResponse, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to get account info: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Place Order
    server.tool(
        "place_order",
        {
            symbol: z.string().describe("Trading pair symbol, e.g. BTCUSDT"),
            side: z.enum(["BUY", "SELL"]).describe("Order side"),
            type: z.enum(["LIMIT", "MARKET", "STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT", "LIMIT_MAKER"])
                .describe("Order type"),
            timeInForce: z.enum(["GTC", "IOC", "FOK", "GTX"]).optional()
                .describe("Time in force (required for LIMIT orders)"),
            quantity: z.number().optional().describe("Order quantity"),
            quoteOrderQty: z.number().optional().describe("Quote quantity (for MARKET orders)"),
            price: z.number().optional().describe("Order price (required for LIMIT orders)"),
            stopPrice: z.number().optional().describe("Stop price (for STOP orders)"),
            newClientOrderId: z.string().optional().describe("Custom order ID"),
            newOrderRespType: z.enum(["ACK", "RESULT", "FULL"]).optional()
                .describe("Response type (default: FULL for MARKET/LIMIT)")
        },
        async (args: any) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                // Validate required parameters based on order type
                if (args.type === OrderType.LIMIT) {
                    if (!args.price) {
                        throw new Error("Price is required for LIMIT orders");
                    }
                    if (!args.quantity) {
                        throw new Error("Quantity is required for LIMIT orders");
                    }
                    if (!args.timeInForce) {
                        args.timeInForce = TimeInForce.GTC; // Default to GTC
                    }
                }
                
                if (args.type === OrderType.MARKET) {
                    if (!args.quantity && !args.quoteOrderQty) {
                        throw new Error("Either quantity or quoteOrderQty is required for MARKET orders");
                    }
                }
                
                // Remove undefined values
                const params = Object.fromEntries(
                    Object.entries(args).filter(([_, v]) => v !== undefined)
                );
                
                const queryString = createSignedRequest(params, secretKey);
                
                const response = await axios.post<OrderResponse>(
                    `${baseUrl}/api/v3/order?${queryString}`,
                    null,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(response.data, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to place order: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Cancel Order
    server.tool(
        "cancel_order",
        {
            symbol: z.string().describe("Trading pair symbol, e.g. BTCUSDT"),
            orderId: z.number().optional().describe("Order ID to cancel"),
            origClientOrderId: z.string().optional().describe("Original client order ID"),
            newClientOrderId: z.string().optional().describe("New client order ID for this cancel")
        },
        async (args: { symbol: string; orderId?: number; origClientOrderId?: string; newClientOrderId?: string }) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                if (!args.orderId && !args.origClientOrderId) {
                    throw new Error("Either orderId or origClientOrderId must be provided");
                }
                
                // Remove undefined values
                const params = Object.fromEntries(
                    Object.entries(args).filter(([_, v]) => v !== undefined)
                );
                
                const queryString = createSignedRequest(params, secretKey);
                
                const response = await axios.delete(
                    `${baseUrl}/api/v3/order?${queryString}`,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(response.data, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to cancel order: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Query Order
    server.tool(
        "query_order",
        {
            symbol: z.string().describe("Trading pair symbol, e.g. BTCUSDT"),
            orderId: z.number().optional().describe("Order ID to query"),
            origClientOrderId: z.string().optional().describe("Original client order ID")
        },
        async (args: { symbol: string; orderId?: number; origClientOrderId?: string }) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                if (!args.orderId && !args.origClientOrderId) {
                    throw new Error("Either orderId or origClientOrderId must be provided");
                }
                
                // Remove undefined values
                const params = Object.fromEntries(
                    Object.entries(args).filter(([_, v]) => v !== undefined)
                );
                
                const queryString = createSignedRequest(params, secretKey);
                
                const response = await axios.get(
                    `${baseUrl}/api/v3/order?${queryString}`,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(response.data, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to query order: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Get Open Orders
    server.tool(
        "get_open_orders",
        {
            symbol: z.string().optional().describe("Trading pair symbol (optional, returns all if not specified)")
        },
        async (args: { symbol?: string }) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                const params = args.symbol ? { symbol: args.symbol } : {};
                const queryString = createSignedRequest(params, secretKey);
                
                const response = await axios.get(
                    `${baseUrl}/api/v3/openOrders?${queryString}`,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(response.data, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to get open orders: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Cancel All Orders
    server.tool(
        "cancel_all_orders",
        {
            symbol: z.string().describe("Trading pair symbol, e.g. BTCUSDT")
        },
        async (args: { symbol: string }) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                const queryString = createSignedRequest({ symbol: args.symbol }, secretKey);
                
                const response = await axios.delete(
                    `${baseUrl}/api/v3/openOrders?${queryString}`,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(response.data, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to cancel all orders: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Get Order History
    server.tool(
        "get_order_history",
        {
            symbol: z.string().describe("Trading pair symbol, e.g. BTCUSDT"),
            orderId: z.number().optional().describe("Start searching from this order ID"),
            startTime: z.number().optional().describe("Start time in milliseconds"),
            endTime: z.number().optional().describe("End time in milliseconds"),
            limit: z.number().optional().describe("Number of orders to return (default 500, max 1000)")
        },
        async (args: { symbol: string; orderId?: number; startTime?: number; endTime?: number; limit?: number }) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                // Remove undefined values
                const params = Object.fromEntries(
                    Object.entries(args).filter(([_, v]) => v !== undefined)
                );
                
                const queryString = createSignedRequest(params, secretKey);
                
                const response = await axios.get(
                    `${baseUrl}/api/v3/allOrders?${queryString}`,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(response.data, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to get order history: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Get Trade History
    server.tool(
        "get_trade_history",
        {
            symbol: z.string().describe("Trading pair symbol, e.g. BTCUSDT"),
            orderId: z.number().optional().describe("Filter trades by this order ID"),
            startTime: z.number().optional().describe("Start time in milliseconds"),
            endTime: z.number().optional().describe("End time in milliseconds"),
            fromId: z.number().optional().describe("Trade ID to start from"),
            limit: z.number().optional().describe("Number of trades to return (default 500, max 1000)")
        },
        async (args: { symbol: string; orderId?: number; startTime?: number; endTime?: number; fromId?: number; limit?: number }) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                // Remove undefined values
                const params = Object.fromEntries(
                    Object.entries(args).filter(([_, v]) => v !== undefined)
                );
                
                const queryString = createSignedRequest(params, secretKey);
                
                const response = await axios.get(
                    `${baseUrl}/api/v3/myTrades?${queryString}`,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(response.data, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Failed to get trade history: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );

    // Test Order (validate without placing)
    server.tool(
        "test_order",
        {
            symbol: z.string().describe("Trading pair symbol, e.g. BTCUSDT"),
            side: z.enum(["BUY", "SELL"]).describe("Order side"),
            type: z.enum(["LIMIT", "MARKET", "STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT", "LIMIT_MAKER"])
                .describe("Order type"),
            timeInForce: z.enum(["GTC", "IOC", "FOK", "GTX"]).optional()
                .describe("Time in force (required for LIMIT orders)"),
            quantity: z.number().optional().describe("Order quantity"),
            quoteOrderQty: z.number().optional().describe("Quote quantity (for MARKET orders)"),
            price: z.number().optional().describe("Order price (required for LIMIT orders)"),
            stopPrice: z.number().optional().describe("Stop price (for STOP orders)"),
            computeCommissionRates: z.boolean().optional().describe("Calculate commission rates")
        },
        async (args: any) => {
            try {
                const { apiKey, secretKey } = validateApiCredentials();
                const baseUrl = getBaseUrl();
                
                // Validate required parameters based on order type
                if (args.type === OrderType.LIMIT) {
                    if (!args.price) {
                        throw new Error("Price is required for LIMIT orders");
                    }
                    if (!args.quantity) {
                        throw new Error("Quantity is required for LIMIT orders");
                    }
                    if (!args.timeInForce) {
                        args.timeInForce = TimeInForce.GTC;
                    }
                }
                
                if (args.type === OrderType.MARKET) {
                    if (!args.quantity && !args.quoteOrderQty) {
                        throw new Error("Either quantity or quoteOrderQty is required for MARKET orders");
                    }
                }
                
                // Remove undefined values
                const params = Object.fromEntries(
                    Object.entries(args).filter(([_, v]) => v !== undefined)
                );
                
                const queryString = createSignedRequest(params, secretKey);
                
                const response = await axios.post(
                    `${baseUrl}/api/v3/order/test?${queryString}`,
                    null,
                    {
                        headers: {
                            "X-MBX-APIKEY": apiKey
                        },
                        proxy: getProxy()
                    }
                );
                
                const result = args.computeCommissionRates 
                    ? response.data 
                    : { status: "Order validation successful", ...args };
                
                return {
                    content: [{ 
                        type: "text", 
                        text: JSON.stringify(result, null, 2) 
                    }]
                };
            } catch (error: any) {
                return {
                    content: [{ 
                        type: "text", 
                        text: `Order validation failed: ${error.response?.data?.msg || error.message}` 
                    }],
                    isError: true
                };
            }
        }
    );
}