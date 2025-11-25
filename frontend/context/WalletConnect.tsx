'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';

/**
 * Utility function to format addresses for display (0x1234...abcd)
 * @param {string} address 
 * @returns {string}
 */
const shortenAddress = (address) => {
    if (!address) return '';
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
};

const WalletContext = createContext(undefined);

/**
 * @typedef {object} WalletContextType
 * @property {ethers.Provider | null} provider
 * @property {string | null} account The connected wallet address
 * @property {string | null} balance The ETH balance formatted as a string
 * @property {number | null} chainId The current blockchain ID
 * @property {boolean} isConnected Whether MetaMask is connected and the app is authorized
 * @property {boolean} isLoading Whether connection logic is currently running
 * @property {boolean} isMetaMaskInstalled Whether the MetaMask extension is detected
 * @property {() => Promise<void>} connectWallet Function to prompt MetaMask connection
 * @property {() => void} disconnectWallet Function to clear the connection state in the app
 * @property {string} shortenedAccount The shortened version of the account address
 */

/**
 * Custom hook to consume the wallet context.
 * @returns {WalletContextType}
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  const ethereum = typeof window !== 'undefined' ? window.ethereum : null;

  const getChainInfo = useCallback(async (currentProvider, currentAccount) => {
    if (!currentProvider || !currentAccount) return;

    try {
      const ethBalance = await currentProvider.getBalance(currentAccount);
      const network = await currentProvider.getNetwork();

      setBalance(ethers.formatEther(ethBalance));
      setChainId(Number(network.chainId));
    } catch (err) {
      console.error('Error fetching chain info:', err);
      toast({
        title: 'Network Error',
        description: 'Failed to fetch network information.',
        variant: 'destructive',
      });
    }
  }, []);

  // --- NEW DISCONNECT FUNCTION ---
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setProvider(null); // Clear provider state as well
    // Note: We cannot programmatically force MetaMask to forget permission, 
    // but clearing app state achieves the goal for the user session.
    toast({ title: 'Wallet Disconnected', description: 'Web3 session cleared due to user logout.' });
  }, []);
  // -----------------------------

  // 1. Initial Setup and Status Check
  const initializeWallet = useCallback(async () => {
    if (ethereum) {
      setIsMetaMaskInstalled(true);
      const newProvider = new ethers.BrowserProvider(ethereum);
      setProvider(newProvider);

      try {
        // Check if the site is already connected
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const connectedAccount = accounts[0];
          setAccount(connectedAccount);
          await getChainInfo(newProvider, connectedAccount);
        }
      } catch (err) {
        console.error('Initial connection check failed:', err);
      }
    }
    setIsLoading(false);
  }, [ethereum, getChainInfo]);

  // 2. Connection Handler (User action)
  const connectWallet = useCallback(async () => {
    if (!ethereum) {
      toast({
        title: 'MetaMask Required',
        description: 'Please install MetaMask to use Web3 features.',
        variant: 'destructive',
        action: {
          label: 'Install',
          onClick: () => window.open('https://metamask.io/download/', '_blank')
        }
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const newAccount = accounts[0];
      
      const newProvider = new ethers.BrowserProvider(ethereum);
      setProvider(newProvider);

      setAccount(newAccount);
      
      await getChainInfo(newProvider, newAccount);

      toast({
        title: 'Wallet Connected',
        description: `Successfully connected: ${shortenAddress(newAccount)}`,
      });

    } catch (err) {
      console.error('Connection failed:', err);
      toast({
        title: 'Connection Rejected',
        description: 'You declined the wallet connection request.',
        variant: 'destructive',
      });
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  }, [ethereum, getChainInfo]);

  // 3. Event Listeners for MetaMask
  useEffect(() => {
    if (ethereum && provider && account) {
      // Handle account change
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setBalance(null);
          setChainId(null);
          // Do not show toast here as it will conflict with app logout toast
          // toast({ title: 'Wallet Disconnected', description: 'MetaMask account changed or disconnected.' });
        } else {
          setAccount(accounts[0]);
          getChainInfo(provider, accounts[0]);
          toast({ title: 'Account Changed', description: `Switched to: ${shortenAddress(accounts[0])}` });
        }
      };

      // Handle chain change
      const handleChainChanged = (newChainId) => {
        setChainId(Number(newChainId));
        // Re-fetch balance since network changed
        if (account) {
            getChainInfo(provider, account);
        }
        toast({ title: 'Network Changed', description: `Switched to Chain ID: ${Number(newChainId)}` });
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [ethereum, provider, account, getChainInfo]);

  // Run initialization only once
  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);


  const contextValue = {
    provider,
    account,
    balance,
    chainId,
    isConnected: !!account,
    isLoading,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet, // EXPOSED TO CONTEXT
    shortenedAccount: shortenAddress(account),
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}