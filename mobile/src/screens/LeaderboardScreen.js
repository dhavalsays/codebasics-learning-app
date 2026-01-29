import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import useUserStore from '../store/userStore';

const LeaderboardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('weekly');
  const {
    weeklyLeaderboard,
    allTimeLeaderboard,
    userRank,
    fetchWeeklyLeaderboard,
    fetchAllTimeLeaderboard,
    fetchUserRank,
    isLoading,
  } = useUserStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchWeeklyLeaderboard(),
      fetchAllTimeLeaderboard(),
      fetchUserRank(),
    ]);
  };

  const leaderboard = activeTab === 'weekly' ? weeklyLeaderboard : allTimeLeaderboard;

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return COLORS.textSecondary;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return null;
  };

  const renderLeaderboardItem = (item, index) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;

    return (
      <View
        key={item.userId}
        style={[
          styles.leaderboardItem,
          isTopThree && styles.topThreeItem,
        ]}
      >
        <View style={styles.rankContainer}>
          {getRankIcon(rank) ? (
            <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) + '30' }]}>
              <Ionicons name={getRankIcon(rank)} size={16} color={getRankColor(rank)} />
            </View>
          ) : (
            <Text style={styles.rankText}>#{rank}</Text>
          )}
        </View>

        <View style={styles.userInfo}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(item.name || 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.userLevel}>Level {item.level || 1}</Text>
          </View>
        </View>

        <View style={styles.xpContainer}>
          <Ionicons name="star" size={14} color={COLORS.warning} />
          <Text style={styles.xpText}>
            {formatNumber(activeTab === 'weekly' ? item.weeklyXp : item.totalXp)}
          </Text>
        </View>
      </View>
    );
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
          onPress={() => setActiveTab('weekly')}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={activeTab === 'weekly' ? COLORS.primary : COLORS.textLight}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'weekly' && styles.activeTabText,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'allTime' && styles.activeTab]}
          onPress={() => setActiveTab('allTime')}
        >
          <Ionicons
            name="infinite"
            size={18}
            color={activeTab === 'allTime' ? COLORS.primary : COLORS.textLight}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'allTime' && styles.activeTabText,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Your Rank Card */}
      {userRank && (
        <View style={styles.yourRankCard}>
          <View style={styles.yourRankInfo}>
            <Text style={styles.yourRankLabel}>Your Rank</Text>
            <View style={styles.yourRankRow}>
              <Text style={styles.yourRankNumber}>
                #{activeTab === 'weekly' ? userRank.weeklyRank : userRank.allTimeRank || '-'}
              </Text>
              <View style={styles.yourXpContainer}>
                <Ionicons name="star" size={16} color={COLORS.warning} />
                <Text style={styles.yourXpText}>
                  {formatNumber(activeTab === 'weekly' ? userRank.weeklyXp : userRank.totalXp)} XP
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.improveButton}>
            <Text style={styles.improveButtonText}>Keep Going!</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Leaderboard List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top 3 Podium */}
        {leaderboard?.length >= 3 && (
          <View style={styles.podium}>
            {/* 2nd Place */}
            <View style={[styles.podiumItem, styles.secondPlace]}>
              <View style={[styles.podiumAvatar, styles.silverAvatar]}>
                <Text style={styles.podiumAvatarText}>
                  {(leaderboard[1]?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaderboard[1]?.name}
              </Text>
              <Text style={styles.podiumXp}>
                {formatNumber(activeTab === 'weekly' ? leaderboard[1]?.weeklyXp : leaderboard[1]?.totalXp)} XP
              </Text>
              <View style={[styles.podiumBase, styles.silverBase]}>
                <Ionicons name="medal" size={20} color="#C0C0C0" />
                <Text style={styles.podiumRank}>2</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View style={[styles.podiumItem, styles.firstPlace]}>
              <View style={[styles.podiumAvatar, styles.goldAvatar]}>
                <Text style={styles.podiumAvatarText}>
                  {(leaderboard[0]?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaderboard[0]?.name}
              </Text>
              <Text style={styles.podiumXp}>
                {formatNumber(activeTab === 'weekly' ? leaderboard[0]?.weeklyXp : leaderboard[0]?.totalXp)} XP
              </Text>
              <View style={[styles.podiumBase, styles.goldBase]}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <Text style={styles.podiumRank}>1</Text>
              </View>
            </View>

            {/* 3rd Place */}
            <View style={[styles.podiumItem, styles.thirdPlace]}>
              <View style={[styles.podiumAvatar, styles.bronzeAvatar]}>
                <Text style={styles.podiumAvatarText}>
                  {(leaderboard[2]?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.podiumName} numberOfLines={1}>
                {leaderboard[2]?.name}
              </Text>
              <Text style={styles.podiumXp}>
                {formatNumber(activeTab === 'weekly' ? leaderboard[2]?.weeklyXp : leaderboard[2]?.totalXp)} XP
              </Text>
              <View style={[styles.podiumBase, styles.bronzeBase]}>
                <Ionicons name="ribbon" size={20} color="#CD7F32" />
                <Text style={styles.podiumRank}>3</Text>
              </View>
            </View>
          </View>
        )}

        {/* Rest of the list */}
        {leaderboard?.slice(3).map((item, index) => renderLeaderboardItem(item, index + 3))}

        {leaderboard?.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No leaderboard data yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.white,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  yourRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight + '20',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  yourRankInfo: {
    flex: 1,
  },
  yourRankLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  yourRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yourRankNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 12,
  },
  yourXpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yourXpText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 4,
  },
  improveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  improveButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingTop: 20,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  firstPlace: {
    marginBottom: 20,
  },
  secondPlace: {
    marginBottom: 0,
  },
  thirdPlace: {
    marginBottom: 0,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
  },
  goldAvatar: {
    backgroundColor: '#FFD700' + '30',
    borderColor: '#FFD700',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  silverAvatar: {
    backgroundColor: '#C0C0C0' + '30',
    borderColor: '#C0C0C0',
  },
  bronzeAvatar: {
    backgroundColor: '#CD7F32' + '30',
    borderColor: '#CD7F32',
  },
  podiumAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumXp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  podiumBase: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  goldBase: {
    backgroundColor: '#FFD700' + '20',
    height: 80,
    justifyContent: 'center',
  },
  silverBase: {
    backgroundColor: '#C0C0C0' + '20',
    height: 60,
    justifyContent: 'center',
  },
  bronzeBase: {
    backgroundColor: '#CD7F32' + '20',
    height: 50,
    justifyContent: 'center',
  },
  podiumRank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  topThreeItem: {
    display: 'none',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  userLevel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});

export default LeaderboardScreen;
