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
import useTestStore from '../store/testStore';
import useAuthStore from '../store/authStore';
import StreakCard from '../components/StreakCard';
import QuickActionCard from '../components/QuickActionCard';
import ProgressCard from '../components/ProgressCard';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { profile, stats, streak, fetchProfile, fetchStats, fetchStreak, isLoading } = useUserStore();
  const { careerTestHistory, fetchCareerHistory } = useTestStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      fetchProfile(),
      fetchStats(),
      fetchStreak(),
      fetchCareerHistory(),
    ]);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const hasCompletedCareerTest = careerTestHistory?.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{profile?.name || user?.name || 'Learner'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Badges')}
          >
            <Ionicons name="ribbon-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Streak Card */}
        <StreakCard
          currentStreak={profile?.currentStreak || 0}
          longestStreak={streak?.longestStreak || 0}
        />

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="compass"
            title="Career Test"
            subtitle={hasCompletedCareerTest ? 'Retake Test' : 'Find Your Path'}
            color={COLORS.roleDA}
            onPress={() => navigation.navigate('CareerTestIntro')}
          />
          <QuickActionCard
            icon="code-slash"
            title="Skill Tests"
            subtitle="Practice MCQs"
            color={COLORS.roleDS}
            onPress={() => navigation.navigate('Tests')}
          />
        </View>

        {/* Progress Overview */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.progressCards}>
          <ProgressCard
            icon="star"
            label="Total XP"
            value={stats?.totalXp || 0}
            color={COLORS.warning}
          />
          <ProgressCard
            icon="checkmark-circle"
            label="Tests Taken"
            value={stats?.skillTestsCompleted || 0}
            color={COLORS.success}
          />
          <ProgressCard
            icon="ribbon"
            label="Badges"
            value={stats?.badgesEarned || 0}
            color={COLORS.info}
          />
        </View>

        {/* Career Test Results Preview */}
        {hasCompletedCareerTest && (
          <>
            <Text style={styles.sectionTitle}>Latest Career Result</Text>
            <TouchableOpacity
              style={styles.careerResultCard}
              onPress={() => navigation.navigate('CareerCompare')}
            >
              <View style={styles.careerResultHeader}>
                <Text style={styles.careerResultTitle}>Your Best Fit</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </View>
              <View style={styles.roleScores}>
                <RoleScore
                  role="Data Analyst"
                  score={careerTestHistory[0]?.daScore || 0}
                  color={COLORS.roleDA}
                />
                <RoleScore
                  role="Data Scientist"
                  score={careerTestHistory[0]?.dsScore || 0}
                  color={COLORS.roleDS}
                />
                <RoleScore
                  role="Data Engineer"
                  score={careerTestHistory[0]?.deScore || 0}
                  color={COLORS.roleDE}
                />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Start Career Test CTA */}
        {!hasCompletedCareerTest && (
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => navigation.navigate('CareerTestIntro')}
          >
            <View style={styles.ctaContent}>
              <Ionicons name="compass" size={40} color={COLORS.primary} />
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Discover Your Data Career</Text>
                <Text style={styles.ctaSubtitle}>
                  Take a 5-minute test to find which role suits you best
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const RoleScore = ({ role, score, color }) => (
  <View style={styles.roleScore}>
    <View style={[styles.roleScoreBar, { backgroundColor: color + '20' }]}>
      <View
        style={[
          styles.roleScoreBarFill,
          { width: `${score}%`, backgroundColor: color },
        ]}
      />
    </View>
    <View style={styles.roleScoreInfo}>
      <Text style={styles.roleScoreName}>{role}</Text>
      <Text style={[styles.roleScoreValue, { color }]}>{score}%</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCards: {
    flexDirection: 'row',
    gap: 12,
  },
  careerResultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  careerResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  careerResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  roleScores: {
    gap: 12,
  },
  roleScore: {
    gap: 4,
  },
  roleScoreBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  roleScoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  roleScoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleScoreName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  roleScoreValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryLight + '15',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '30',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ctaText: {
    marginLeft: 16,
    flex: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
