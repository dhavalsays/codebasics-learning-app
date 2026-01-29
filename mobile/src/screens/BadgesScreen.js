import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import useUserStore from '../store/userStore';

const BadgesScreen = ({ navigation }) => {
  const { badges, fetchBadges, isLoading } = useUserStore();

  useEffect(() => {
    fetchBadges();
  }, []);

  const getBadgeIcon = (badgeType) => {
    const icons = {
      first_test: 'rocket',
      streak_7: 'flame',
      streak_30: 'bonfire',
      perfect_score: 'star',
      career_explorer: 'compass',
      skill_master: 'school',
      top_10_weekly: 'trophy',
      top_3_weekly: 'medal',
      share_result: 'share-social',
      early_bird: 'sunny',
      night_owl: 'moon',
      completionist: 'checkmark-done-circle',
      consistent_learner: 'calendar',
      speed_demon: 'flash',
      knowledge_seeker: 'book',
      community_champion: 'people',
    };
    return icons[badgeType] || 'ribbon';
  };

  const getBadgeColor = (badgeType, earned) => {
    if (!earned) return COLORS.textLight;

    const colors = {
      first_test: COLORS.success,
      streak_7: COLORS.warning,
      streak_30: COLORS.error,
      perfect_score: '#FFD700',
      career_explorer: COLORS.roleDA,
      skill_master: COLORS.roleDS,
      top_10_weekly: COLORS.info,
      top_3_weekly: '#FFD700',
      share_result: COLORS.primary,
      early_bird: COLORS.warning,
      night_owl: COLORS.roleDS,
      completionist: COLORS.success,
      consistent_learner: COLORS.roleDE,
      speed_demon: COLORS.error,
      knowledge_seeker: COLORS.info,
      community_champion: COLORS.primary,
    };
    return colors[badgeType] || COLORS.primary;
  };

  const earnedBadges = badges?.filter((b) => b.earned) || [];
  const unearnedBadges = badges?.filter((b) => !b.earned) || [];

  const renderBadge = (badge, isEarned) => {
    const color = getBadgeColor(badge.type, isEarned);

    return (
      <TouchableOpacity
        key={badge.id}
        style={[
          styles.badgeCard,
          !isEarned && styles.badgeCardLocked,
        ]}
        disabled={!isEarned}
      >
        <View
          style={[
            styles.badgeIconContainer,
            { backgroundColor: color + (isEarned ? '20' : '10') },
          ]}
        >
          <Ionicons
            name={getBadgeIcon(badge.type)}
            size={32}
            color={color}
          />
          {!isEarned && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={16} color={COLORS.textLight} />
            </View>
          )}
        </View>
        <Text
          style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}
          numberOfLines={2}
        >
          {badge.name}
        </Text>
        <Text style={styles.badgeDescription} numberOfLines={2}>
          {badge.description}
        </Text>
        {isEarned && badge.earnedAt && (
          <Text style={styles.badgeDate}>
            {new Date(badge.earnedAt).toLocaleDateString()}
          </Text>
        )}
        {!isEarned && badge.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${badge.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{badge.progress}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Badges</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchBadges} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons name="ribbon" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.summaryValue}>{earnedBadges.length}</Text>
            <Text style={styles.summaryLabel}>Earned</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons name="lock-closed" size={24} color={COLORS.textLight} />
            </View>
            <Text style={styles.summaryValue}>{unearnedBadges.length}</Text>
            <Text style={styles.summaryLabel}>Locked</Text>
          </View>
        </View>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Earned Badges</Text>
            <View style={styles.badgeGrid}>
              {earnedBadges.map((badge) => renderBadge(badge, true))}
            </View>
          </>
        )}

        {/* Locked Badges */}
        {unearnedBadges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Keep Going!</Text>
            <Text style={styles.sectionSubtitle}>
              Complete more activities to unlock these badges
            </Text>
            <View style={styles.badgeGrid}>
              {unearnedBadges.map((badge) => renderBadge(badge, false))}
            </View>
          </>
        )}

        {badges?.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="ribbon-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Badges Yet</Text>
            <Text style={styles.emptyText}>
              Complete tests and activities to earn badges!
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: COLORS.textSecondary,
  },
  badgeDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  badgeDate: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default BadgesScreen;
