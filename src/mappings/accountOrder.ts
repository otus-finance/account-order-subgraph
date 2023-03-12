import { Address } from '@graphprotocol/graph-ts'
import { AccountOrder, Order } from '../../generated/schema';
import { Deposit, OrderCancelled, OrderFilled, StrikeOrderPlaced, Withdraw } from '../../generated/templates/AccountOrder/AccountOrder';

export function handleDeposit(event: Deposit): void {
  let accountOrderAddr = event.address as Address;
  let accountOrder = AccountOrder.load(accountOrderAddr.toHex());

  if (!accountOrder) {
    accountOrder = new AccountOrder(accountOrderAddr.toHex());
  }

  accountOrder.balance = accountOrder.balance.plus(event.params.amount);
  accountOrder.save();
}

export function handleWithdraw(event: Withdraw): void {
  let accountOrderAddr = event.address as Address;
  let accountOrder = AccountOrder.load(accountOrderAddr.toHex());

  if (!accountOrder) {
    accountOrder = new AccountOrder(accountOrderAddr.toHex());
  }

  accountOrder.balance = accountOrder.balance.minus(event.params.amount);
  accountOrder.save();
}

enum OrderStatus {
  Open,
  Cancelled,
  Filled
}

export function handleOrderFilled(event: OrderFilled): void {
  let accountOrderAddr = event.address as Address;
  let orderId = event.params._orderId;

  let order = Order.load(accountOrderAddr.toHex() + '-' + orderId.toHex());
  if (!order) {
    order = new Order(accountOrderAddr.toHex() + '-' + orderId.toHex());
  }

  order.status = OrderStatus.Filled.toString();
  order.save();
}

export function handleOrderCancelled(event: OrderCancelled): void {
  let accountOrderAddr = event.address as Address;
  let orderId = event.params.orderId;

  let order = Order.load(accountOrderAddr.toHex() + '-' + orderId.toHex());
  if (!order) {
    order = new Order(accountOrderAddr.toHex() + '-' + orderId.toHex());
  }

  order.status = OrderStatus.Filled.toString();
  order.save();
}

export function handleStrikeOrderPlaced(event: StrikeOrderPlaced): void {
  let accountOrderAddr = event.address as Address;
  let orderId = event.params._orderId;
  let order = new Order(accountOrderAddr.toHex() + '-' + orderId.toHex());

  order.account = accountOrderAddr.toHex();

  let orderInfo = event.params._tradeOrder;
  let trade = orderInfo.strikeTrade;

  order.orderId = orderId;
  order.gelatoTaskId = orderInfo.gelatoTaskId;
  order.committedMargin = orderInfo.committedMargin;
  order.market = trade.market;
  order.collatPercent = trade.collatPercent;
  order.optionType = trade.optionType;
  order.strikeId = trade.strikeId;
  order.size = trade.size;
  order.positionId = trade.positionId;
  order.tradeDirection = trade.tradeDirection;
  order.targetPrice = trade.targetPrice;
  order.tradeDirection = trade.tradeDirection;
  order.targetVolatility = trade.targetVolatility;
  // add order type
  order.save();
}