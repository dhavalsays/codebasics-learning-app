import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import Button from '../../components/Button';
import ScoreCircle from '../../components/ScoreCircle';

const SkillResultScreen = ({ navigation, route }) => {
  const { result, test } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isPassed = result.percentage >= (test.passingScore || 70);

  const getResultConfig = () => {
    if (result.percentage >= 90) {
      return {
        title: 'Excellent!',
        message: 'Outstanding performance! You have mastered this topic.',
        color: COLORS.success,
        icon: 'trophy',
      };
    }
    if (result.percentage >= 70) {
      return {
        title: 'Good Job!',
        message: 'You passed the test. Keep up the good work!',
        color: COLORS.success,
        icon: 'checkmark-circle',
      };
    }
    if (result.percentage >= 50) {
      return {
        title: 'Keep Trying!',
        message: 'You\'re on the right track. Practice more to improve.',
        color: COLORS.warning,
        icon: 'trending-up',
      };
    }
    return {
      title: 'Needs Practice',
      message: 'Don\'t give up! Review the material and try again.',
      color: COLORS.error,
      icon: 'refresh',
    };
  };

  const resultConfig = getResultConfig();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I scored ${result.percentage}% on the ${test.name} test on Codebasics Assess! Try it yourself: https://codebasics.io/assess`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{test.name}</Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        <Animated.View
          style={[
            styles.resultCard,
            { backgroundColor: resultConfig.color + '15' },
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View
            style={[
              styles.resultIconContainer,
              { backgroundColor: resultConfig.color + '20' },
            ]}
          >
            <Ionicons
              name={resultConfig.icon}
              size={48}
              color={resultConfig.color}
            />
          </View>
          <Text style={[styles.resultTitle, { color: resultConfig.color }]}>
            {resultConfig.title}
          </Text>
          <Text style={styles.resultMessage}>{resultConfig.message}</Text>

          <ScoreCircle
            score={result.percentage}
            size={140}
            strokeWidth={12}
            color={resultConfig.color}
          />

          <View
            style={[
              styles.passedBadge,
              { backgroundColor: isPassed ? COLORS.success + '20' : COLORS.error + '20' },
            ]}
          >
            <Ionicons
              name={isPassed ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={isPassed ? COLORS.success : COLORS.error}
            />
            <Text
              style={[
                styles.passedText,
                { color: isPassed ? COLORS.success : COLORS.error },
              ]}
            >
              {isPassed ? 'Passed' : 'Not Passed'}
            </Text>
          </View>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{result.correctCount}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close" size={24} color={COLORS.error} />
            <Text style={styles.statValue}>{result.incorrectCount}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="help" size={24} color={COLORS.textLight} />
            <Text style={styles.statValue}>{result.unansweredCount || 0}</Text>
            <Text style={styles.statLabel}>Skipped</Text>
          </View>
        </View>

        {/* XP Earned */}
        {result.xpEarned > 0 && (
          <View style={styles.xpCard}>
            <Ionicons name="star" size={28} color={COLORS.warning} />
            <View style={styles.xpInfo}>
              <Text style={styles.xpTitle}>XP Earned</Text>
              <Text style={styles.xpValue}>+{result.xpEarned} XP</Text>
            </View>
          </View>
        )}

        {/* Badge Earned */}
        {result.badgeEarned && (
          <View style={styles.badgeCard}>
            <Ionicons name="ribbon" size={28} color={COLORS.info} />
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeTitle}>Badge Unlocked!</Text>
              <Text style={styles.badgeName}>{result.badgeEarned.name}</Text>
            </View>
          </View>
        )}

        {/* Topic Performance (if available) */}
        {result.topicPerformance && result.topicPerformance.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Topic Breakdown</Text>
            {result.topicPerformance.map((topic, index) => (
              <View key={index} style={styles.topicCard}>
                <View style={styles.topicHeader}>
                  <Text style={styles.topicName}>{topic.name}</Text>
                  <Text
                    style={[
                      styles.topicScore,
                      {
                        color:
                          topic.percentage >= 70
                            ? COLORS.success
                            : topic.percentage >= 50
                            ? COLORS.warning
                            : COLORS.error,
                      },
                    ]}
                  >
                    {topic.percentage}%
                  </Text>
                </View>
                <View style={styles.topicBar}>
                  <View
                    style={[
                      styles.topicBarFill,
                      {
                        width: `${topic.percentage}%`,
                        backgroundColor:
                          topic.percentage >= 70
                            ? COLORS.success
                            : topic.percentage >= 50
                            ? COLORS.warning
                            : COLORS.error,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Review Answers"
            onPress={() => {
              // Navigate to review screen
            }}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Retake Test"
            onPress={() => navigation.replace('SkillTestIntro', { test })}
            style={styles.actionButton}
          />
          <Button
            title="Back to Tests"
            variant="ghost"
            onPress={() => navigation.navigate('MainTabs')}
          />
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  passedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  passedText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  xpInfo: {
    marginLeft: 12,
  },
  xpTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  badgeInfo: {
    marginLeft: 12,
  },
  badgeTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.info,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 16,
  },
  topicCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  topicScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  topicBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  topicBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
});

export default SkillResultScreen;
