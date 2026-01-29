import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LEVELS } from '../constants/theme';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import ProgressCard from '../components/ProgressCard';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { profile, stats, fetchProfile, fetchStats, isLoading } = useUserStore();

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getCurrentLevel = () => {
    const xp = stats?.totalXp || 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXp) {
        return {
          current: LEVELS[i],
          next: LEVELS[i + 1],
          progress: LEVELS[i + 1]
            ? ((xp - LEVELS[i].minXp) / (LEVELS[i + 1].minXp - LEVELS[i].minXp)) * 100
            : 100,
        };
      }
    }
    return { current: LEVELS[0], next: LEVELS[1], progress: 0 };
  };

  const levelInfo = getCurrentLevel();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profile?.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(profile?.name || user?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{levelInfo.current.level}</Text>
            </View>
          </View>

          <Text style={styles.profileName}>{profile?.name || user?.name}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>

          {/* Level Progress */}
          <View style={styles.levelSection}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelName}>{levelInfo.current.name}</Text>
              {levelInfo.next && (
                <Text style={styles.levelNext}>
                  Next: {levelInfo.next.name}
                </Text>
              )}
            </View>
            <View style={styles.levelBar}>
              <View
                style={[
                  styles.levelBarFill,
                  { width: `${levelInfo.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {stats?.totalXp || 0} XP
              {levelInfo.next && ` / ${levelInfo.next.minXp} XP`}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <ProgressCard
            icon="flame"
            label="Day Streak"
            value={profile?.currentStreak || 0}
            color={COLORS.warning}
          />
          <ProgressCard
            icon="checkmark-circle"
            label="Tests Completed"
            value={stats?.skillTestsCompleted || 0}
            color={COLORS.success}
          />
          <ProgressCard
            icon="ribbon"
            label="Badges Earned"
            value={stats?.badgesEarned || 0}
            color={COLORS.info}
          />
        </View>

        {/* Career Test Stats */}
        <View style={styles.careerStatsCard}>
          <View style={styles.careerStatsHeader}>
            <Ionicons name="compass" size={24} color={COLORS.primary} />
            <Text style={styles.careerStatsTitle}>Career Tests</Text>
          </View>
          <View style={styles.careerStatsRow}>
            <View style={styles.careerStatItem}>
              <Text style={styles.careerStatValue}>
                {stats?.careerTestsCompleted || 0}
              </Text>
              <Text style={styles.careerStatLabel}>Taken</Text>
            </View>
            {stats?.lastCareerResult && (
              <View style={styles.careerStatItem}>
                <Text style={[styles.careerStatValue, { color: COLORS.primary }]}>
                  {stats.lastCareerResult.bestFit?.toUpperCase()}
                </Text>
                <Text style={styles.careerStatLabel}>Best Fit</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Badges')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.info + '20' }]}>
              <Ionicons name="ribbon" size={20} color={COLORS.info} />
            </View>
            <Text style={styles.actionText}>View Badges</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Ionicons name="trophy" size={20} color={COLORS.warning} />
            </View>
            <Text style={styles.actionText}>Leaderboard</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('CareerCompare')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.roleDA + '20' }]}>
              <Ionicons name="bar-chart" size={20} color={COLORS.roleDA} />
            </View>
            <Text style={styles.actionText}>Career Results</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.textLight + '20' }]}>
              <Ionicons name="settings" size={20} color={COLORS.textLight} />
            </View>
            <Text style={styles.actionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  levelSection: {
    width: '100%',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  levelNext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  levelBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  careerStatsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  careerStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  careerStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  careerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  careerStatItem: {
    alignItems: 'center',
  },
  careerStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  careerStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '15',
    borderRadius: 12,
    padding: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    marginLeft: 8,
  },
});

export default ProfileScreen;
