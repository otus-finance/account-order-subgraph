import { BigInt, log } from '@graphprotocol/graph-ts'
import { AccountOrder } from '../../generated/schema';
import { AccountOrder as AccountOrderTemplate } from '../../generated/templates';
import { NewAccount } from '../../generated/AccountFactory/AccountFactory';

export function handleNewAccount(event: NewAccount): void {
  AccountOrderTemplate.create(event.params.account);
  log.info('something something', [event.params.account.toString()]);
  let accountOrder = new AccountOrder(event.params.account.toHex());
  accountOrder.owner = event.params.owner;
  accountOrder.balance = BigInt.fromI32(0);
  accountOrder.save();
}