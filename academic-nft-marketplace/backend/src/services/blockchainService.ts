import { ethers } from 'ethers';
import config from '../config/environment';

interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  symbol: string;
  testnet: boolean;
}

interface ContractConfig {
  address: string;
  abi: any[];
}

class BlockchainService {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();
  private networks: Map<number, NetworkConfig> = new Map();

  constructor() {
    this.initializeNetworks();
    this.initializeProviders();
  }

  private initializeNetworks() {
    // Ethereum networks
    this.networks.set(1, {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: `https://mainnet.infura.io/v3/${config.INFURA_PROJECT_ID}`,
      blockExplorer: 'https://etherscan.io',
      symbol: 'ETH',
      testnet: false
    });

    this.networks.set(5, {
      chainId: 5,
      name: 'Ethereum Goerli',
      rpcUrl: `https://goerli.infura.io/v3/${config.INFURA_PROJECT_ID}`,
      blockExplorer: 'https://goerli.etherscan.io',
      symbol: 'ETH',
      testnet: true
    });

    // Polygon networks
    this.networks.set(137, {
      chainId: 137,
      name: 'Polygon Mainnet',
      rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`,
      blockExplorer: 'https://polygonscan.com',
      symbol: 'MATIC',
      testnet: false
    });

    this.networks.set(80001, {
      chainId: 80001,
      name: 'Polygon Mumbai',
      rpcUrl: config.POLYGON_RPC_URL || `https://polygon-mumbai.g.alchemy.com/v2/${config.ALCHEMY_API_KEY}`,
      blockExplorer: 'https://mumbai.polygonscan.com',
      symbol: 'MATIC',
      testnet: true
    });
  }

  private initializeProviders() {
    for (const [chainId, network] of this.networks) {
      try {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        this.providers.set(chainId, provider);
        console.log(`✅ Initialized provider for ${network.name}`);
      } catch (error) {
        console.error(`❌ Failed to initialize provider for ${network.name}:`, error);
      }
    }
  }

  // Get provider for specific chain
  getProvider(chainId: number): ethers.JsonRpcProvider | null {
    return this.providers.get(chainId) || null;
  }

  // Get network configuration
  getNetworkConfig(chainId: number): NetworkConfig | null {
    return this.networks.get(chainId) || null;
  }

  // Get all supported networks
  getSupportedNetworks(): NetworkConfig[] {
    return Array.from(this.networks.values());
  }

  // Initialize contract instance
  async initializeContract(
    contractAddress: string,
    abi: any[],
    chainId: number,
    privateKey?: string
  ): Promise<ethers.Contract | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) {
        throw new Error(`Provider not found for chain ID ${chainId}`);
      }

      let contract: ethers.Contract;
      
      if (privateKey) {
        // For write operations - use wallet with private key
        const wallet = new ethers.Wallet(privateKey, provider);
        contract = new ethers.Contract(contractAddress, abi, wallet);
      } else {
        // For read operations - use provider only
        contract = new ethers.Contract(contractAddress, abi, provider);
      }

      const contractKey = `${contractAddress}_${chainId}`;
      this.contracts.set(contractKey, contract);
      
      console.log(`✅ Contract initialized at ${contractAddress} on chain ${chainId}`);
      return contract;
    } catch (error) {
      console.error(`❌ Failed to initialize contract:`, error);
      return null;
    }
  }

  // Get contract instance
  getContract(contractAddress: string, chainId: number): ethers.Contract | null {
    const contractKey = `${contractAddress}_${chainId}`;
    return this.contracts.get(contractKey) || null;
  }

  // Verify transaction status with performance tracking
  async verifyTransaction(txHash: string, chainId: number): Promise<{
    confirmed: boolean;
    blockNumber?: number;
    gasUsed?: string;
    status?: number;
    error?: string;
  }> {
    return this.trackPerformance('verifyTransaction', async () => {
      try {
        const provider = this.getProvider(chainId);
        if (!provider) {
          return { confirmed: false, error: 'Provider not found' };
        }

        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          return { confirmed: false, error: 'Transaction not found' };
        }

        return {
          confirmed: receipt.status === 1,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          status: receipt.status || 0
        };
      } catch (error) {
        console.error('Error verifying transaction:', error);
        return { confirmed: false, error: (error as Error).message };
      }
    });
  }

  // Estimate gas for transaction with performance tracking
  async estimateGas(
    contractAddress: string,
    method: string,
    params: any[],
    chainId: number,
    from?: string
  ): Promise<{ gasLimit: string; gasPrice: string; estimatedCost: string } | null> {
    return this.trackPerformance('estimateGas', async () => {
      try {
        const provider = this.getProvider(chainId);
        const contract = this.getContract(contractAddress, chainId);
        
        if (!provider || !contract) {
          throw new Error('Provider or contract not found');
        }

        // Get current gas price
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

        // Estimate gas limit
        const gasLimit = await contract[method].estimateGas(...params, from ? { from } : {});
        
        // Calculate estimated cost
        const estimatedCost = gasLimit * gasPrice;

        return {
          gasLimit: gasLimit.toString(),
          gasPrice: gasPrice.toString(),
          estimatedCost: ethers.formatEther(estimatedCost)
        };
      } catch (error) {
        console.error('Error estimating gas:', error);
        return null;
      }
    });
  }

  // Get wallet balance
  async getBalance(address: string, chainId: number): Promise<string | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) {
        return null;
      }

      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  }

  // Validate wallet address
  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  // Get transaction history for address
  async getTransactionHistory(
    address: string, 
    chainId: number, 
    limit: number = 10
  ): Promise<any[] | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) {
        return null;
      }

      const currentBlock = await provider.getBlockNumber();
      const transactions = [];

      // Note: This is a simplified implementation
      // In production, you'd want to use a more efficient method
      // like querying an indexing service (e.g., The Graph, Moralis)
      for (let i = 0; i < Math.min(limit, 100); i++) {
        const blockNumber = currentBlock - i;
        if (blockNumber < 0) break;

        try {
          const block = await provider.getBlock(blockNumber);
          if (block && block.transactions) {
            for (const txHash of block.transactions.slice(0, 5)) {
              const tx = await provider.getTransaction(txHash);
              if (tx && (tx.from === address || tx.to === address)) {
                transactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: ethers.formatEther(tx.value),
                  blockNumber: tx.blockNumber,
                  timestamp: block.timestamp
                });
                
                if (transactions.length >= limit) {
                  return transactions;
                }
              }
            }
          }
        } catch (error) {
          // Skip failed blocks
          continue;
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return null;
    }
  }

  // Optimized gas price calculation with EIP-1559 support
  async getOptimalGasPrice(chainId: number): Promise<{
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    type: 'legacy' | 'eip1559';
  } | null> {
    try {
      const provider = this.getProvider(chainId);
      if (!provider) return null;

      const feeData = await provider.getFeeData();
      
      // Check if network supports EIP-1559
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        return {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          type: 'eip1559'
        };
      }

      return {
        gasPrice: feeData.gasPrice || ethers.parseUnits('20', 'gwei'),
        type: 'legacy'
      };
    } catch (error) {
      console.error('Error getting optimal gas price:', error);
      return null;
    }
  }

  // Batch mint NFTs with gas optimization
  async batchMintNFTs(
    contractAddress: string,
    recipients: string[],
    tokenURIs: string[],
    chainId: number,
    privateKey: string
  ): Promise<{ success: boolean; txHash?: string; gasUsed?: string; error?: string }> {
    try {
      const contract = this.getContract(contractAddress, chainId);
      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      if (recipients.length !== tokenURIs.length) {
        return { success: false, error: 'Recipients and URIs length mismatch' };
      }

      // Get optimal gas pricing
      const gasData = await this.getOptimalGasPrice(chainId);
      if (!gasData) {
        return { success: false, error: 'Failed to get gas pricing' };
      }

      const txOptions: any = {
        gasLimit: await contract.batchMint.estimateGas(recipients, tokenURIs)
      };

      if (gasData.type === 'eip1559') {
        txOptions.maxFeePerGas = gasData.maxFeePerGas;
        txOptions.maxPriorityFeePerGas = gasData.maxPriorityFeePerGas;
      } else {
        txOptions.gasPrice = gasData.gasPrice;
      }

      const tx = await contract.batchMint(recipients, tokenURIs, txOptions);
      const receipt = await tx.wait();

      return {
        success: receipt.status === 1,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error in batch mint:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Batch transfer NFTs with gas optimization
  async batchTransferNFTs(
    contractAddress: string,
    from: string,
    recipients: string[],
    tokenIds: number[],
    chainId: number,
    privateKey: string
  ): Promise<{ success: boolean; txHash?: string; gasUsed?: string; error?: string }> {
    try {
      if (recipients.length !== tokenIds.length) {
        return { success: false, error: 'Recipients and token IDs length mismatch' };
      }

      const contract = this.getContract(contractAddress, chainId);
      if (!contract) {
        return { success: false, error: 'Contract not found' };
      }

      const gasData = await this.getOptimalGasPrice(chainId);
      if (!gasData) {
        return { success: false, error: 'Failed to get gas pricing' };
      }

      const txOptions: any = {
        gasLimit: await contract.batchTransfer.estimateGas(from, recipients, tokenIds)
      };

      if (gasData.type === 'eip1559') {
        txOptions.maxFeePerGas = gasData.maxFeePerGas;
        txOptions.maxPriorityFeePerGas = gasData.maxPriorityFeePerGas;
      } else {
        txOptions.gasPrice = gasData.gasPrice;
      }

      const tx = await contract.batchTransfer(from, recipients, tokenIds, txOptions);
      const receipt = await tx.wait();

      return {
        success: receipt.status === 1,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error in batch transfer:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Performance monitoring for blockchain operations
  private performanceMetrics: Map<string, {
    totalCalls: number;
    totalTime: number;
    averageTime: number;
    lastUpdated: number;
    errors: number;
  }> = new Map();

  private trackPerformance<T>(
    operation: string,
    func: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    return func()
      .then((result) => {
        this.updateMetrics(operation, Date.now() - startTime, false);
        return result;
      })
      .catch((error) => {
        this.updateMetrics(operation, Date.now() - startTime, true);
        throw error;
      });
  }

  private updateMetrics(operation: string, duration: number, isError: boolean) {
    const existing = this.performanceMetrics.get(operation) || {
      totalCalls: 0,
      totalTime: 0,
      averageTime: 0,
      lastUpdated: Date.now(),
      errors: 0
    };

    existing.totalCalls += 1;
    existing.totalTime += duration;
    existing.averageTime = existing.totalTime / existing.totalCalls;
    existing.lastUpdated = Date.now();
    if (isError) existing.errors += 1;

    this.performanceMetrics.set(operation, existing);

    // Log slow operations (>5 seconds)
    if (duration > 5000) {
      console.warn(`🐌 Slow blockchain operation: ${operation} took ${duration}ms`);
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): { [operation: string]: any } {
    const metrics: { [key: string]: any } = {};
    
    for (const [operation, data] of this.performanceMetrics) {
      metrics[operation] = {
        ...data,
        errorRate: (data.errors / data.totalCalls) * 100,
        callsPerMinute: data.totalCalls / ((Date.now() - data.lastUpdated) / 60000) || 0
      };
    }
    
    return metrics;
  }

  // Batch call multiple contract methods with performance tracking
  async batchCall(calls: Array<{
    contractAddress: string;
    method: string;
    params: any[];
    chainId: number;
  }>): Promise<any[]> {
    return this.trackPerformance('batchCall', async () => {
      const results = await Promise.allSettled(
        calls.map(async (call) => {
          const contract = this.getContract(call.contractAddress, call.chainId);
          if (!contract) {
            throw new Error(`Contract not found: ${call.contractAddress}`);
          }
          return await contract[call.method](...call.params);
        })
      );

      return results.map((result) => 
        result.status === 'fulfilled' ? result.value : null
      );
    });
  }

  // Monitor contract events
  async setupEventListener(
    contractAddress: string,
    eventName: string,
    chainId: number,
    callback: (event: any) => void,
    fromBlock: number = 'latest'
  ): Promise<boolean> {
    try {
      const contract = this.getContract(contractAddress, chainId);
      if (!contract) {
        return false;
      }

      const filter = contract.filters[eventName]();
      contract.on(filter, callback);
      
      console.log(`✅ Event listener setup for ${eventName} on contract ${contractAddress}`);
      return true;
    } catch (error) {
      console.error('Error setting up event listener:', error);
      return false;
    }
  }

  // Get contract events
  async getContractEvents(
    contractAddress: string,
    eventName: string,
    chainId: number,
    fromBlock: number = 0,
    toBlock: number | string = 'latest'
  ): Promise<any[] | null> {
    try {
      const contract = this.getContract(contractAddress, chainId);
      if (!contract) {
        return null;
      }

      const filter = contract.filters[eventName]();
      const events = await contract.queryFilter(filter, fromBlock, toBlock);
      
      return events.map(event => ({
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        args: event.args,
        event: event.event
      }));
    } catch (error) {
      console.error('Error getting contract events:', error);
      return null;
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;