import { ethers } from 'ethers';
import blockchainService from './blockchainService';
import config from '../config/environment';

interface BatchMintRequest {
  recipient: string;
  achievementType: string;
  metadata: {
    studentId: string;
    courseId: string;
    courseName: string;
    grade: string;
    semester: string;
    year: string;
    description: string;
    imageUrl?: string;
  };
}

interface GasOptimizationResult {
  estimatedGas: string;
  recommendedBatchSize: number;
  totalTransactions: number;
  estimatedTotalCost: string;
  savings: {
    individualMints: string;
    batchMints: string;
    percentSaved: number;
  };
}

class NFTOptimizationService {
  private readonly BATCH_SIZE_LIMIT = 50;
  private readonly GAS_PRICE_BUFFER = 1.1; // 10% buffer for gas price fluctuations

  // Calculate optimal batch size for minting based on gas limits
  async calculateOptimalBatchSize(
    mintRequests: BatchMintRequest[],
    chainId: number
  ): Promise<GasOptimizationResult> {
    try {
      // Estimate gas for single mint vs batch mint
      const singleMintGas = await this.estimateSingleMintGas(mintRequests[0], chainId);
      const batchGasEstimates = await this.estimateBatchGasForSizes(mintRequests, chainId);

      if (!singleMintGas) {
        throw new Error('Failed to estimate single mint gas');
      }

      // Find optimal batch size (maximize efficiency while staying under block gas limit)
      const blockGasLimit = await this.getBlockGasLimit(chainId);
      let optimalBatchSize = 1;
      let lowestGasPerMint = singleMintGas.gasPerUnit;

      for (const estimate of batchGasEstimates) {
        if (estimate.totalGas < blockGasLimit * 0.8 && estimate.gasPerUnit < lowestGasPerMint) {
          optimalBatchSize = estimate.batchSize;
          lowestGasPerMint = estimate.gasPerUnit;
        }
      }

      const totalMints = mintRequests.length;
      const totalBatches = Math.ceil(totalMints / optimalBatchSize);
      
      // Calculate costs
      const gasPrice = await this.getCurrentGasPrice(chainId);
      const individualCost = BigInt(singleMintGas.totalGas) * BigInt(totalMints) * gasPrice;
      const batchCost = BigInt(Math.ceil(lowestGasPerMint * totalMints)) * gasPrice;
      
      const percentSaved = ((Number(individualCost - batchCost) / Number(individualCost)) * 100);

      return {
        estimatedGas: (lowestGasPerMint * totalMints).toString(),
        recommendedBatchSize: optimalBatchSize,
        totalTransactions: totalBatches,
        estimatedTotalCost: ethers.formatEther(batchCost),
        savings: {
          individualMints: ethers.formatEther(individualCost),
          batchMints: ethers.formatEther(batchCost),
          percentSaved: Math.max(0, percentSaved)
        }
      };
    } catch (error) {
      console.error('Error calculating optimal batch size:', error);
      throw error;
    }
  }

  // Execute optimized batch minting
  async executeOptimizedBatchMint(
    mintRequests: BatchMintRequest[],
    contractAddress: string,
    chainId: number,
    privateKey: string
  ): Promise<{
    success: boolean;
    transactions: Array<{
      batchNumber: number;
      txHash: string;
      recipients: string[];
      gasUsed: string;
      cost: string;
    }>;
    totalGasUsed: string;
    totalCost: string;
    error?: string;
  }> {
    try {
      // Calculate optimal batch size
      const optimization = await this.calculateOptimalBatchSize(mintRequests, chainId);
      const batchSize = optimization.recommendedBatchSize;

      console.log(`🚀 Starting optimized batch mint: ${mintRequests.length} NFTs in batches of ${batchSize}`);

      const transactions = [];
      let totalGasUsed = BigInt(0);
      let totalCost = BigInt(0);

      // Process in optimal batches
      for (let i = 0; i < mintRequests.length; i += batchSize) {
        const batch = mintRequests.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        console.log(`📦 Processing batch ${batchNumber}/${Math.ceil(mintRequests.length / batchSize)}`);

        // Prepare batch data
        const recipients = batch.map(req => req.recipient);
        const tokenURIs = await Promise.all(
          batch.map(req => this.createTokenURI(req.metadata))
        );

        // Execute batch mint
        const result = await blockchainService.batchMintNFTs(
          contractAddress,
          recipients,
          tokenURIs,
          chainId,
          privateKey
        );

        if (!result.success) {
          throw new Error(`Batch ${batchNumber} failed: ${result.error}`);
        }

        const gasUsed = BigInt(result.gasUsed || '0');
        const gasPrice = await this.getCurrentGasPrice(chainId);
        const cost = gasUsed * gasPrice;

        totalGasUsed += gasUsed;
        totalCost += cost;

        transactions.push({
          batchNumber,
          txHash: result.txHash!,
          recipients,
          gasUsed: gasUsed.toString(),
          cost: ethers.formatEther(cost)
        });

        // Add delay between batches to avoid nonce issues
        if (i + batchSize < mintRequests.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`✅ Batch minting completed: ${transactions.length} transactions`);

      return {
        success: true,
        transactions,
        totalGasUsed: totalGasUsed.toString(),
        totalCost: ethers.formatEther(totalCost)
      };
    } catch (error) {
      console.error('Error in optimized batch mint:', error);
      return {
        success: false,
        transactions: [],
        totalGasUsed: '0',
        totalCost: '0',
        error: (error as Error).message
      };
    }
  }

  // Create IPFS-compatible metadata URI
  private async createTokenURI(metadata: BatchMintRequest['metadata']): Promise<string> {
    const tokenMetadata = {
      name: `Academic Achievement: ${metadata.courseName}`,
      description: metadata.description,
      image: metadata.imageUrl || this.generateDefaultImage(metadata.achievementType),
      attributes: [
        { trait_type: 'Student ID', value: metadata.studentId },
        { trait_type: 'Course ID', value: metadata.courseId },
        { trait_type: 'Course Name', value: metadata.courseName },
        { trait_type: 'Grade', value: metadata.grade },
        { trait_type: 'Semester', value: metadata.semester },
        { trait_type: 'Year', value: metadata.year },
        { trait_type: 'Achievement Type', value: metadata.achievementType },
        { trait_type: 'Issue Date', value: new Date().toISOString() }
      ],
      properties: {
        soul_bound: true,
        transferable: false,
        academic_verification: true
      }
    };

    // In production, upload to IPFS and return the hash
    // For now, return a data URI or mock IPFS hash
    return `data:application/json,${encodeURIComponent(JSON.stringify(tokenMetadata))}`;
  }

  private generateDefaultImage(achievementType: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/api/images/achievements/${achievementType}.png`;
  }

  private async estimateSingleMintGas(request: BatchMintRequest, chainId: number): Promise<{
    totalGas: number;
    gasPerUnit: number;
  } | null> {
    try {
      const contractAddress = config.ACADEMIC_NFT_CONTRACT_ADDRESS;
      if (!contractAddress) return null;

      const tokenURI = await this.createTokenURI(request.metadata);
      const estimation = await blockchainService.estimateGas(
        contractAddress,
        'mintAchievement',
        [request.recipient, tokenURI],
        chainId,
        request.recipient
      );

      if (!estimation) return null;

      const gasLimit = parseInt(estimation.gasLimit);
      return {
        totalGas: gasLimit,
        gasPerUnit: gasLimit
      };
    } catch (error) {
      console.error('Error estimating single mint gas:', error);
      return null;
    }
  }

  private async estimateBatchGasForSizes(
    requests: BatchMintRequest[],
    chainId: number
  ): Promise<Array<{ batchSize: number; totalGas: number; gasPerUnit: number }>> {
    const estimates = [];
    const testSizes = [5, 10, 20, 30, 40, 50].filter(size => size <= requests.length);

    for (const batchSize of testSizes) {
      try {
        const batch = requests.slice(0, batchSize);
        const recipients = batch.map(req => req.recipient);
        const tokenURIs = await Promise.all(
          batch.map(req => this.createTokenURI(req.metadata))
        );

        const contractAddress = config.ACADEMIC_NFT_CONTRACT_ADDRESS;
        if (!contractAddress) continue;

        const estimation = await blockchainService.estimateGas(
          contractAddress,
          'batchMint',
          [recipients, tokenURIs],
          chainId
        );

        if (estimation) {
          const totalGas = parseInt(estimation.gasLimit);
          estimates.push({
            batchSize,
            totalGas,
            gasPerUnit: totalGas / batchSize
          });
        }
      } catch (error) {
        console.error(`Error estimating gas for batch size ${batchSize}:`, error);
      }
    }

    return estimates;
  }

  private async getBlockGasLimit(chainId: number): Promise<number> {
    try {
      const provider = blockchainService.getProvider(chainId);
      if (!provider) return 30000000; // Default gas limit

      const latestBlock = await provider.getBlock('latest');
      return Number(latestBlock?.gasLimit || 30000000);
    } catch (error) {
      console.error('Error getting block gas limit:', error);
      return 30000000; // Default fallback
    }
  }

  private async getCurrentGasPrice(chainId: number): Promise<bigint> {
    try {
      const provider = blockchainService.getProvider(chainId);
      if (!provider) return ethers.parseUnits('20', 'gwei');

      const feeData = await provider.getFeeData();
      return feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    } catch (error) {
      console.error('Error getting current gas price:', error);
      return ethers.parseUnits('20', 'gwei');
    }
  }

  // Get real-time gas price recommendations
  async getGasPriceRecommendations(chainId: number): Promise<{
    slow: string;
    standard: string;
    fast: string;
    instant: string;
    currentNetwork: string;
  }> {
    try {
      const provider = blockchainService.getProvider(chainId);
      const networkConfig = blockchainService.getNetworkConfig(chainId);
      
      if (!provider || !networkConfig) {
        throw new Error('Provider or network config not found');
      }

      const feeData = await provider.getFeeData();
      const baseGasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

      return {
        slow: ethers.formatUnits(baseGasPrice * BigInt(80) / BigInt(100), 'gwei'),
        standard: ethers.formatUnits(baseGasPrice, 'gwei'),
        fast: ethers.formatUnits(baseGasPrice * BigInt(120) / BigInt(100), 'gwei'),
        instant: ethers.formatUnits(baseGasPrice * BigInt(150) / BigInt(100), 'gwei'),
        currentNetwork: networkConfig.name
      };
    } catch (error) {
      console.error('Error getting gas price recommendations:', error);
      return {
        slow: '10',
        standard: '20',
        fast: '30',
        instant: '50',
        currentNetwork: 'Unknown'
      };
    }
  }
}

// Create singleton instance
const nftOptimizationService = new NFTOptimizationService();

export default nftOptimizationService;
export { BatchMintRequest, GasOptimizationResult };