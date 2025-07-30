export enum OrderSide {
    BUY = 'BUY',
    SELL = 'SELL'
}

export enum OrderType {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    STOP_LOSS = 'STOP_LOSS',
    STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
    TAKE_PROFIT = 'TAKE_PROFIT',
    TAKE_PROFIT_LIMIT = 'TAKE_PROFIT_LIMIT',
    LIMIT_MAKER = 'LIMIT_MAKER'
}

export enum TimeInForce {
    GTC = 'GTC',  // Good Till Cancel
    IOC = 'IOC',  // Immediate Or Cancel
    FOK = 'FOK',  // Fill or Kill
    GTX = 'GTX'   // Good Till Crossing
}

export enum OrderStatus {
    NEW = 'NEW',
    PARTIALLY_FILLED = 'PARTIALLY_FILLED',
    FILLED = 'FILLED',
    CANCELED = 'CANCELED',
    PENDING_CANCEL = 'PENDING_CANCEL',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    EXPIRED_IN_MATCH = 'EXPIRED_IN_MATCH'
}

export enum OrderResponseType {
    ACK = 'ACK',
    RESULT = 'RESULT',
    FULL = 'FULL'
}

export interface PlaceOrderParams {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    timeInForce?: TimeInForce;
    quantity?: number;
    quoteOrderQty?: number;
    price?: number;
    newClientOrderId?: string;
    stopPrice?: number;
    trailingDelta?: number;
    icebergQty?: number;
    newOrderRespType?: OrderResponseType;
    recvWindow?: number;
}

export interface OrderResponse {
    symbol: string;
    orderId: number;
    orderListId: number;
    clientOrderId: string;
    transactTime: number;
    price?: string;
    origQty?: string;
    executedQty?: string;
    cummulativeQuoteQty?: string;
    status?: OrderStatus;
    timeInForce?: TimeInForce;
    type?: OrderType;
    side?: OrderSide;
    fills?: Array<{
        price: string;
        qty: string;
        commission: string;
        commissionAsset: string;
        tradeId: number;
    }>;
}

export interface AccountInfo {
    makerCommission: number;
    takerCommission: number;
    buyerCommission: number;
    sellerCommission: number;
    commissionRates: {
        maker: string;
        taker: string;
        buyer: string;
        seller: string;
    };
    canTrade: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    brokered: boolean;
    requireSelfTradePrevention: boolean;
    preventSor: boolean;
    updateTime: number;
    accountType: string;
    balances: Array<{
        asset: string;
        free: string;
        locked: string;
    }>;
    permissions: string[];
    uid: number;
}