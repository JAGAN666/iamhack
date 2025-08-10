import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WalletIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LinkIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useEnhancedWallet } from '../../contexts/EnhancedWalletContext';
import toast from 'react-hot-toast';

const EnhancedWalletButton: React.FC = () => {
  const {
    isConnected,
    address,
    chainId,
    networkName,
    balance,
    isLoading,
    error,
    supportedNetworks,
    pendingTransactions,
    nftBalances,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
    clearError
  } = useEnhancedWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  const currentNetwork = supportedNetworks.find(n => n.chainId === chainId);
  const isUnsupportedNetwork = chainId && !currentNetwork;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatBalance = (bal: string) => parseFloat(bal).toFixed(4);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const openBlockExplorer = () => {
    if (currentNetwork && address) {
      const url = `${currentNetwork.blockExplorerUrls[0]}/address/${address}`;
      window.open(url, '_blank');
    }
  };

  const handleNetworkSwitch = async (newChainId: number) => {
    await switchNetwork(newChainId);
    setShowNetworkSelector(false);
    setIsDropdownOpen(false);
  };

  const handleRefreshBalance = async () => {
    await refreshBalance();
    toast.success('Balance refreshed');
  };

  // Wallet not connected state
  if (!isConnected) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={connectWallet}
        disabled={isLoading}
        className="relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </>
        ) : (
          <>
            <WalletIcon className="w-4 h-4 mr-2" />
            Connect Wallet
          </>
        )}
      </motion.button>
    );
  }

  return (
    <div className="relative">
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[-50px] left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-2 z-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center text-red-700 text-xs">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                {error}
              </div>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Wallet Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`inline-flex items-center px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
            isUnsupportedNetwork 
              ? 'border-red-300 bg-red-50' 
              : pendingTransactions.size > 0
              ? 'border-yellow-300 bg-yellow-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Network Indicator */}
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isUnsupportedNetwork 
              ? 'bg-red-500' 
              : currentNetwork?.testnet 
              ? 'bg-yellow-500' 
              : 'bg-green-500'
          }`} />

          {/* Address & Balance */}
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">
              {address && formatAddress(address)}
            </span>
            <span className="text-xs text-gray-500">
              {balance && `${formatBalance(balance)} ${currentNetwork?.nativeCurrency.symbol || 'ETH'}`}
            </span>
          </div>

          {/* Pending Transactions Indicator */}
          {pendingTransactions.size > 0 && (
            <div className="ml-2 flex items-center">
              <ClockIcon className="w-4 h-4 text-yellow-600 animate-pulse" />
              <span className="ml-1 text-xs text-yellow-600 font-medium">
                {pendingTransactions.size}
              </span>
            </div>
          )}

          <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>
      </motion.div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
                  <p className="text-sm text-gray-600">{networkName || 'Unknown Network'}</p>
                </div>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Account</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => address && copyToClipboard(address)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Copy address"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={openBlockExplorer}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="View on block explorer"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded-lg break-all">
                {address}
              </p>
              
              {/* Balance */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-semibold text-gray-900">
                  {balance && formatBalance(balance)} {currentNetwork?.nativeCurrency.symbol || 'ETH'}
                </span>
                <button
                  onClick={handleRefreshBalance}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title="Refresh balance"
                >
                  <ArrowPathIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Network Section */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Network</span>
                <button
                  onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Switch Network
                </button>
              </div>
              
              {currentNetwork ? (
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    currentNetwork.testnet ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm">{currentNetwork.chainName}</span>
                  {currentNetwork.testnet && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Testnet
                    </span>
                  )}
                </div>
              ) : isUnsupportedNetwork ? (
                <div className="text-sm text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  Unsupported Network
                </div>
              ) : null}

              {/* Network Selector */}
              <AnimatePresence>
                {showNetworkSelector && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    {supportedNetworks.map((network) => (
                      <button
                        key={network.chainId}
                        onClick={() => handleNetworkSwitch(network.chainId)}
                        className={`w-full flex items-center p-2 rounded-lg text-left text-sm hover:bg-gray-50 ${
                          chainId === network.chainId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          network.testnet ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="flex-1">{network.chainName}</span>
                        {chainId === network.chainId && (
                          <CheckCircleIcon className="w-4 h-4 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NFT Balances */}
            {nftBalances.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700 block mb-2">Your NFTs</span>
                <div className="space-y-1">
                  {nftBalances.slice(0, 3).map((nft) => (
                    <div key={nft.id} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      {nft.name}
                    </div>
                  ))}
                  {nftBalances.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{nftBalances.length - 3} more NFTs
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pending Transactions */}
            {pendingTransactions.size > 0 && (
              <div className="p-4 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  Pending Transactions ({pendingTransactions.size})
                </span>
                <div className="space-y-2">
                  {Array.from(pendingTransactions.values()).slice(0, 2).map((tx) => (
                    <div key={tx.hash} className="flex items-center text-sm">
                      <ClockIcon className="w-4 h-4 text-yellow-600 mr-2 animate-pulse" />
                      <span className="font-mono text-gray-600">
                        {tx.hash.slice(0, 10)}...
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4">
              <button
                onClick={() => {
                  disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="w-full bg-red-50 text-red-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-red-100 transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedWalletButton;