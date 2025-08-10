import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

export const NET = import.meta.env.VITE_STACKS_NETWORK;
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const CONTRACT_NAME = import.meta.env.VITE_CONTRACT_NAME;
export const ASSET_NAME = import.meta.env.VITE_ASSET_NAME; // (define-fungible-token <ini>)
export const API_URL = import.meta.env.VITE_STACKS_API_URL; // hanya untuk devnet

export const CONTRACT_ID = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
export const ASSET_ID = `${CONTRACT_ID}::${ASSET_NAME}`;

export const NETWORK =
  NET === 'mainnet'
    ? new StacksMainnet()
    : NET === 'devnet'
    ? new StacksMocknet({ url: API_URL })
    : new StacksTestnet();