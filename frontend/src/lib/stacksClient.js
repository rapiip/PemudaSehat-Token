import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '../stacks';
import { callReadOnlyFunction } from '@stacks/transactions';

export async function ro(functionName, functionArgs = [], senderAddress) {
  return callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    network: NETWORK,
    senderAddress: senderAddress ?? CONTRACT_ADDRESS,
  });
}