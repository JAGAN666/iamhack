import React from 'react';

interface NFTViewer3DProps {
  nftType?: string;
  level?: number;
  rarity?: string;
  title?: string;
  size?: string;
}

const NFTViewer3DSimple: React.FC<NFTViewer3DProps> = ({
  nftType = 'gpa_guardian',
  level = 1,
  rarity = 'common',
  title = 'NFT',
  size = 'md'
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getNFTIcon = (nftType: string) => {
    switch (nftType) {
      case 'gpa_guardian': return '🎓';
      case 'research_rockstar': return '🔬';
      case 'leadership_legend': return '👑';
      default: return '🏆';
    }
  };

  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getRarityColor(rarity)} rounded-2xl relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-pattern opacity-10"></div>
      </div>
      
      {/* NFT Content */}
      <div className="relative z-10 text-center text-white">
        <div className="text-4xl mb-2 animate-pulse">
          {getNFTIcon(nftType)}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider opacity-90">
          Level {level}
        </div>
        <div className="text-xs opacity-75 capitalize">
          {rarity}
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-pulse"></div>
    </div>
  );
};

export default NFTViewer3DSimple;