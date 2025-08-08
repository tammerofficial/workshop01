import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, Users, Star, Trophy, 
  TrendingUp, Award, Crown, Heart,
  Settings, Plus, Edit, Trash2,
  Calendar, BarChart3, Zap,
  Target, Diamond, Coins, ShoppingBag
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
  icon: React.ReactNode;
  customers: number;
}

interface LoyaltyCustomer {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: string;
  totalSpent: number;
  joinDate: string;
  lastActivity: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  pointsCost: number;
  type: 'discount' | 'freebie' | 'exclusive';
  description: string;
  redeemed: number;
  available: boolean;
}

const LoyaltyProgram: React.FC = () => {
  const { isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'rewards' | 'tiers' | 'settings'>('overview');

  const tiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      minPoints: 0,
      benefits: ['5% discount on orders', 'Birthday bonus', 'Monthly newsletter'],
      color: 'orange',
      icon: <Coins size={20} />,
      customers: 245
    },
    {
      id: 'silver',
      name: 'Silver',
      minPoints: 500,
      benefits: ['10% discount on orders', 'Free alterations', 'Priority booking', 'Seasonal gifts'],
      color: 'gray',
      icon: <Star size={20} />,
      customers: 89
    },
    {
      id: 'gold',
      name: 'Gold',
      minPoints: 1500,
      benefits: ['15% discount on orders', 'Express service', 'VIP events', 'Personal stylist'],
      color: 'yellow',
      icon: <Trophy size={20} />,
      customers: 34
    },
    {
      id: 'platinum',
      name: 'Platinum',
      minPoints: 3000,
      benefits: ['20% discount on orders', 'Complimentary services', 'Exclusive designs', 'Home visits'],
      color: 'purple',
      icon: <Crown size={20} />,
      customers: 12
    }
  ];

  const topCustomers: LoyaltyCustomer[] = [
    {
      id: 'cust-001',
      name: 'Ahmed Al-Mansouri',
      email: 'ahmed@example.com',
      points: 4500,
      tier: 'Platinum',
      totalSpent: 15600,
      joinDate: '2023-01-15',
      lastActivity: '2025-01-10'
    },
    {
      id: 'cust-002',
      name: 'Fatima Al-Zahra',
      email: 'fatima@example.com',
      points: 2200,
      tier: 'Gold',
      totalSpent: 8900,
      joinDate: '2023-03-22',
      lastActivity: '2025-01-12'
    },
    {
      id: 'cust-003',
      name: 'Mohammed Hassan',
      email: 'mohammed@example.com',
      points: 1800,
      tier: 'Gold',
      totalSpent: 7200,
      joinDate: '2023-05-10',
      lastActivity: '2025-01-08'
    },
    {
      id: 'cust-004',
      name: 'Aisha Abdullah',
      email: 'aisha@example.com',
      points: 850,
      tier: 'Silver',
      totalSpent: 3400,
      joinDate: '2023-08-18',
      lastActivity: '2025-01-14'
    },
    {
      id: 'cust-005',
      name: 'Omar Al-Rashid',
      email: 'omar@example.com',
      points: 650,
      tier: 'Silver',
      totalSpent: 2600,
      joinDate: '2023-10-05',
      lastActivity: '2025-01-11'
    }
  ];

  const rewards: LoyaltyReward[] = [
    {
      id: 'reward-001',
      name: '10% Off Next Order',
      pointsCost: 100,
      type: 'discount',
      description: 'Get 10% discount on your next tailoring order',
      redeemed: 45,
      available: true
    },
    {
      id: 'reward-002',
      name: 'Free Button Replacement',
      pointsCost: 50,
      type: 'freebie',
      description: 'Complimentary button replacement service',
      redeemed: 23,
      available: true
    },
    {
      id: 'reward-003',
      name: 'VIP Consultation',
      pointsCost: 300,
      type: 'exclusive',
      description: 'One-hour personal styling consultation',
      redeemed: 12,
      available: true
    },
    {
      id: 'reward-004',
      name: 'Fabric Protection',
      pointsCost: 150,
      type: 'freebie',
      description: 'Free fabric protection treatment',
      redeemed: 18,
      available: true
    }
  ];

  const getTierColor = (color: string) => {
    const colors = {
      orange: 'from-orange-500 to-orange-600',
      gray: 'from-gray-500 to-gray-600',
      yellow: 'from-yellow-500 to-yellow-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'discount':
        return 'bg-blue-100 text-blue-800';
      case 'freebie':
        return 'bg-green-100 text-green-800';
      case 'exclusive':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalCustomers: 380,
    activeMembers: 342,
    totalPoints: 45600,
    redemptionRate: 68.5
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"
            style={{ color: 'var(--text-primary)' }}>
            <Gift className="h-8 w-8 text-purple-600" />
            Loyalty Program
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Manage customer loyalty tiers, rewards, and engagement
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/loyalty-program/advanced" className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <BarChart3 size={20} />
            Advanced Analytics
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Add Reward
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { 
            label: 'Total Members', 
            value: stats.totalCustomers.toString(), 
            icon: <Users size={24} />, 
            color: 'blue',
            change: '+23 this month'
          },
          { 
            label: 'Active Members', 
            value: stats.activeMembers.toString(), 
            icon: <Heart size={24} />, 
            color: 'green',
            change: '90% engagement'
          },
          { 
            label: 'Points Earned', 
            value: `${(stats.totalPoints / 1000).toFixed(1)}K`, 
            icon: <Star size={24} />, 
            color: 'purple',
            change: '+15% this month'
          },
          { 
            label: 'Redemption Rate', 
            value: `${stats.redemptionRate}%`, 
            icon: <Target size={24} />, 
            color: 'orange',
            change: '+5.2% improvement'
          }
        ].map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b" style={{ borderColor: 'var(--border-color)' }}
      >
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
            { id: 'customers', label: 'Customers', icon: <Users size={16} /> },
            { id: 'rewards', label: 'Rewards', icon: <Gift size={16} /> },
            { id: 'tiers', label: 'Tiers', icon: <Crown size={16} /> },
            { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{ 
                color: activeTab === tab.id ? '#9333ea' : 'var(--text-secondary)' 
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Tier Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Tier Distribution
                </h3>
                <div className="space-y-4">
                  {tiers.map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getTierColor(tier.color)} text-white`}>
                          {tier.icon}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {tier.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {tier.minPoints}+ points
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {tier.customers}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Top Customers
                </h3>
                <div className="space-y-3">
                  {topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {customer.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {customer.tier} • {customer.points} points
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          ${customer.totalSpent.toLocaleString()}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          total spent
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Rewards */}
            <div className="rounded-xl border p-6"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Popular Rewards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)'
                    }}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {reward.name}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRewardTypeColor(reward.type)}`}>
                        {reward.type}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      {reward.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-600">
                        {reward.pointsCost} pts
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {reward.redeemed} redeemed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="rounded-xl border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}>
            <div className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Loyalty Customers
              </h2>
              <Link to="/loyalty-customers" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}>
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                  {topCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {customer.name}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full`}>
                          {customer.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {customer.points.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                        ${customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(customer.lastActivity).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="rounded-xl border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}>
            <div className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Rewards Catalog
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus size={16} />
                Add Reward
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="p-6 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)'
                    }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-600" />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRewardTypeColor(reward.type)}`}>
                          {reward.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {reward.name}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {reward.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-purple-600">
                          {reward.pointsCost}
                        </span>
                        <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
                          points
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {reward.redeemed} redeemed
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {reward.available ? 'Available' : 'Unavailable'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tiers' && (
          <div className="space-y-6">
            {tiers.map((tier) => (
              <div key={tier.id} className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getTierColor(tier.color)} text-white`}>
                      {tier.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {tier.name} Tier
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {tier.minPoints}+ points required • {tier.customers} members
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ borderColor: 'var(--border-color)' }}>
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
                <div>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Benefits:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-600" />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Program Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Points per Dollar Spent
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      defaultValue="10"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Points Expiry (months)
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                      <option value="0">Never expire</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { label: 'Auto-upgrade tiers', value: true, description: 'Automatically upgrade customers to next tier when they reach point threshold' },
                      { label: 'Birthday bonuses', value: true, description: 'Send bonus points on customer birthdays' },
                      { label: 'Referral rewards', value: false, description: 'Give points for successful referrals' },
                      { label: 'Email notifications', value: true, description: 'Send loyalty program updates via email' }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {setting.label}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {setting.description}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={setting.value}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          onChange={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Integration Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      POS Integration
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}>
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      E-commerce Sync
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}>
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Marketing Platform
                    </label>
                    <input
                      type="text"
                      placeholder="API Key"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoyaltyProgram;