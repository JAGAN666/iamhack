import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// MetaMask SDK types are declared in global.d.ts

interface NetworkConfig {
  chainId: number;
  chainIdHex: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testnet: boolean;
}

interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  timestamp: number;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  networkName: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  supportedNetworks: NetworkConfig[];
  pendingTransactions: Map<string, TransactionStatus>;
  isMetaMaskInstalled: boolean;
  gasPrice: string | null;
  nftBalances: any[];
}

interface WalletAction {
  type: 
    | 'SET_LOADING'
    | 'CONNECT_SUCCESS' 
    | 'CONNECT_ERROR' 
    | 'DISCONNECT' 
    | 'UPDATE_BALANCE' 
    | 'UPDATE_NETWORK'
    | 'ADD_PENDING_TX'
    | 'UPDATE_TX_STATUS'
    | 'REMOVE_PENDING_TX'
    | 'SET_METAMASK_STATUS'
    | 'UPDATE_GAS_PRICE'
    | 'UPDATE_NFT_BALANCES'
    | 'SET_ERROR'
    | 'CLEAR_ERROR';
  payload?: any;
}

// Network configurations
const NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    chainIdHex: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
    testnet: false
  },
  5: {
    chainId: 5,
    chainIdHex: '0x5',
    chainName: 'Ethereum Goerli',
    nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    testnet: true
  },
  137: {
    chainId: 137,
    chainIdHex: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com'],
    testnet: false
  },
  80001: {
    chainId: 80001,
    chainIdHex: '0x13881',
    chainName: 'Polygon Mumbai',
    nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    testnet: true
  }
};

const initialState: WalletState = {
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  networkName: null,
  balance: null,
  isLoading: false,
  error: null,
  supportedNetworks: Object.values(NETWORKS),
  pendingTransactions: new Map(),
  isMetaMaskInstalled: false,
  gasPrice: null,
  nftBalances: []
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        isConnected: true,
        address: action.payload.address,
        provider: action.payload.provider,
        signer: action.payload.signer,
        chainId: action.payload.chainId,
        networkName: action.payload.networkName,
        balance: action.payload.balance,
        isLoading: false,
        error: null
      };
    
    case 'CONNECT_ERROR':
      return {
        ...state,
        isConnected: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'DISCONNECT':
      return {
        ...initialState,
        isMetaMaskInstalled: state.isMetaMaskInstalled,
        supportedNetworks: state.supportedNetworks
      };
    
    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };
    
    case 'UPDATE_NETWORK':
      return {
        ...state,
        chainId: action.payload.chainId,
        networkName: action.payload.networkName
      };
    
    case 'ADD_PENDING_TX':
      const newPendingTx = new Map(state.pendingTransactions);
      newPendingTx.set(action.payload.hash, action.payload);
      return { ...state, pendingTransactions: newPendingTx };
    
    case 'UPDATE_TX_STATUS':
      const updatedTx = new Map(state.pendingTransactions);
      const existingTx = updatedTx.get(action.payload.hash);
      if (existingTx) {
        updatedTx.set(action.payload.hash, { ...existingTx, ...action.payload });
      }
      return { ...state, pendingTransactions: updatedTx };
    
    case 'REMOVE_PENDING_TX':
      const filteredTx = new Map(state.pendingTransactions);
      filteredTx.delete(action.payload);
      return { ...state, pendingTransactions: filteredTx };
    
    case 'SET_METAMASK_STATUS':
      return { ...state, isMetaMaskInstalled: action.payload };
    
    case 'UPDATE_GAS_PRICE':
      return { ...state, gasPrice: action.payload };
    
    case 'UPDATE_NFT_BALANCES':
      return { ...state, nftBalances: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  sendTransaction: (transaction: any) => Promise<string | null>;
  signMessage: (message: string) => Promise<string | null>;
  getTransactionStatus: (txHash: string) => TransactionStatus | null;
  addToken: (tokenAddress: string, tokenSymbol: string, tokenDecimals: number) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  refreshNFTBalance: () => Promise<void>;
  estimateGas: (transaction: any) => Promise<string | null>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useEnhancedWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useEnhancedWallet must be used within an EnhancedWalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const EnhancedWalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Check MetaMask installation
  useEffect(() => {
    const checkMetaMask = () => {
      const isInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
      dispatch({ type: 'SET_METAMASK_STATUS', payload: isInstalled });
      
      if (isInstalled) {
        checkExistingConnection();
        setupEventListeners();
      }
    };

    checkMetaMask();
    
    // Listen for MetaMask installation
    const handleEthereumInstall = () => {
      dispatch({ type: 'SET_METAMASK_STATUS', payload: true });
      checkExistingConnection();
      setupEventListeners();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', handleEthereumInstall);
      return () => window.removeEventListener('ethereum#initialized', handleEthereumInstall);
    }
  }, []);

  // Check existing wallet connection
  const checkExistingConnection = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const balance = await provider.getBalance(address);
        
        dispatch({
          type: 'CONNECT_SUCCESS',
          payload: {
            address,
            provider,
            signer,
            chainId: Number(network.chainId),
            networkName: NETWORKS[Number(network.chainId)]?.chainName || 'Unknown Network',
            balance: ethers.formatEther(balance)
          }
        });

        // Update gas price
        updateGasPrice(provider);
      }
    } catch (error) {
      console.error('Failed to check existing connection:', error);
    }
  };

  // Setup event listeners
  const setupEventListeners = () => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        dispatch({ type: 'DISCONNECT' });
        toast('Wallet disconnected', { icon: 'ℹ️' });
      } else if (accounts[0] !== state.address) {
        // Account changed - reconnect
        connectWallet();
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      const networkName = NETWORKS[chainId]?.chainName || 'Unknown Network';
      
      dispatch({
        type: 'UPDATE_NETWORK',
        payload: { chainId, networkName }
      });

      if (state.provider) {
        updateGasPrice(state.provider);
        refreshBalance();
      }
    };

    const handleDisconnect = () => {
      dispatch({ type: 'DISCONNECT' });
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  };

  // Update gas price
  const updateGasPrice = async (provider: ethers.BrowserProvider) => {
    try {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      if (gasPrice) {
        dispatch({
          type: 'UPDATE_GAS_PRICE',
          payload: ethers.formatUnits(gasPrice, 'gwei')
        });
      }
    } catch (error) {
      console.error('Failed to update gas price:', error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!state.isMetaMaskInstalled) {
      toast.error('Please install MetaMask to connect your wallet');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      
      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: {
          address,
          provider,
          signer,
          chainId: Number(network.chainId),
          networkName: NETWORKS[Number(network.chainId)]?.chainName || 'Unknown Network',
          balance: ethers.formatEther(balance)
        }
      });

      updateGasPrice(provider);
      refreshNFTBalance();
      
      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (error: any) {
      const errorMessage = error.code === 4001 
        ? 'Connection rejected by user' 
        : error.message || 'Failed to connect wallet';
      
      dispatch({ type: 'CONNECT_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT' });
    toast.success('Wallet disconnected');
  };

  // Switch network
  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum || !state.isConnected) return;

    const network = NETWORKS[chainId];
    if (!network) {
      toast.error('Unsupported network');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainIdHex }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
        } catch (addError: any) {
          toast.error(`Failed to add ${network.chainName}: ${addError.message}`);
        }
      } else {
        toast.error(`Failed to switch network: ${error.message}`);
      }
    }
  };

  // Send transaction
  const sendTransaction = async (transaction: any): Promise<string | null> => {
    if (!state.signer) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      const tx = await state.signer.sendTransaction(transaction);
      
      dispatch({
        type: 'ADD_PENDING_TX',
        payload: {
          hash: tx.hash,
          status: 'pending',
          confirmations: 0,
          timestamp: Date.now()
        }
      });

      toast.success(`Transaction sent: ${tx.hash.slice(0, 10)}...`);

      // Wait for confirmation
      tx.wait().then((receipt) => {
        dispatch({
          type: 'UPDATE_TX_STATUS',
          payload: {
            hash: tx.hash,
            status: receipt?.status === 1 ? 'confirmed' : 'failed',
            confirmations: receipt?.confirmations || 0,
            gasUsed: receipt?.gasUsed.toString()
          }
        });

        if (receipt?.status === 1) {
          toast.success('Transaction confirmed!');
        } else {
          toast.error('Transaction failed');
        }

        // Remove from pending after some time
        setTimeout(() => {
          dispatch({ type: 'REMOVE_PENDING_TX', payload: tx.hash });
        }, 30000);
      }).catch((error) => {
        dispatch({
          type: 'UPDATE_TX_STATUS',
          payload: {
            hash: tx.hash,
            status: 'failed',
            confirmations: 0
          }
        });
        toast.error(`Transaction failed: ${error.message}`);
      });

      return tx.hash;
    } catch (error: any) {
      toast.error(`Transaction failed: ${error.message}`);
      return null;
    }
  };

  // Sign message
  const signMessage = async (message: string): Promise<string | null> => {
    if (!state.signer) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      const signature = await state.signer.signMessage(message);
      toast.success('Message signed successfully');
      return signature;
    } catch (error: any) {
      toast.error(`Failed to sign message: ${error.message}`);
      return null;
    }
  };

  // Get transaction status
  const getTransactionStatus = (txHash: string): TransactionStatus | null => {
    return state.pendingTransactions.get(txHash) || null;
  };

  // Add token to MetaMask
  const addToken = async (tokenAddress: string, tokenSymbol: string, tokenDecimals: number): Promise<boolean> => {
    if (!window.ethereum) return false;

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: [{
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        }],
      });

      if (wasAdded) {
        toast.success(`${tokenSymbol} added to MetaMask`);
      }
      
      return wasAdded;
    } catch (error: any) {
      toast.error(`Failed to add token: ${error.message}`);
      return false;
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (!state.provider || !state.address) return;

    try {
      const balance = await state.provider.getBalance(state.address);
      dispatch({ type: 'UPDATE_BALANCE', payload: ethers.formatEther(balance) });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  // Refresh NFT balance (placeholder - would integrate with NFT API)
  const refreshNFTBalance = async () => {
    if (!state.address) return;

    try {
      // This would typically call your NFT API or use a service like Moralis
      // For now, we'll simulate some NFTs
      const nfts = [
        { id: '1', type: 'gpa_guardian', name: 'GPA Guardian NFT' },
        { id: '2', type: 'research_rockstar', name: 'Research Rockstar NFT' }
      ];
      dispatch({ type: 'UPDATE_NFT_BALANCES', payload: nfts });
    } catch (error) {
      console.error('Failed to refresh NFT balance:', error);
    }
  };

  // Estimate gas
  const estimateGas = async (transaction: any): Promise<string | null> => {
    if (!state.provider) return null;

    try {
      const gasLimit = await state.provider.estimateGas(transaction);
      return gasLimit.toString();
    } catch (error: any) {
      console.error('Failed to estimate gas:', error);
      return null;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: WalletContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
    signMessage,
    getTransactionStatus,
    addToken,
    refreshBalance,
    refreshNFTBalance,
    estimateGas,
    clearError
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};