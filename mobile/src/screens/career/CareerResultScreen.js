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

const CareerResultScreen = ({ navigation, route }) => {
  const { result } = route.params;
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

  const getRoleConfig = (roleCode) => {
    const configs = {
      da: {
        name: 'Data Analyst',
        color: COLORS.roleDA,
        icon: 'bar-chart',
        description: 'Transform data into actionable business insights',
      },
      ds: {
        name: 'Data Scientist',
        color: COLORS.roleDS,
        icon: 'flask',
        description: 'Build ML models and solve complex analytical problems',
      },
      de: {
        name: 'Data Engineer',
        color: COLORS.roleDE,
        icon: 'server',
        description: 'Design and build scalable data infrastructure',
      },
    };
    return configs[roleCode] || configs.da;
  };

  const getSuitabilityColor = (level) => {
    const colors = {
      EXCELLENT: COLORS.success,
      GOOD: COLORS.success,
      MODERATE: COLORS.warning,
      PARTIAL: COLORS.warning,
      LOW: COLORS.error,
    };
    return colors[level] || COLORS.textSecondary;
  };

  const bestFitConfig = getRoleConfig(result.bestFit);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just took the Codebasics Career Test and my best fit is ${bestFitConfig.name} with a ${result.scores[result.bestFit].percentage}% score! Take the test yourself: https://codebasics.io/assess`,
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
          <Text style={styles.headerTitle}>Your Results</Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Best Fit Card */}
        <Animated.View
          style={[
            styles.bestFitCard,
            { backgroundColor: bestFitConfig.color + '15' },
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.bestFitLabel}>Your Best Fit</Text>
          <View style={styles.bestFitIcon}>
            <Ionicons
              name={bestFitConfig.icon}
              size={48}
              color={bestFitConfig.color}
            />
          </View>
          <Text style={[styles.bestFitRole, { color: bestFitConfig.color }]}>
            {bestFitConfig.name}
          </Text>
          <Text style={styles.bestFitDescription}>
            {bestFitConfig.description}
          </Text>
          <View style={styles.bestFitScore}>
            <ScoreCircle
              score={result.scores[result.bestFit].percentage}
              size={100}
              strokeWidth={8}
              color={bestFitConfig.color}
            />
          </View>
          <View
            style={[
              styles.suitabilityBadge,
              {
                backgroundColor:
                  getSuitabilityColor(
                    result.scores[result.bestFit].suitability.code
                  ) + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.suitabilityText,
                {
                  color: getSuitabilityColor(
                    result.scores[result.bestFit].suitability.code
                  ),
                },
              ]}
            >
              {result.scores[result.bestFit].suitability.level}
            </Text>
          </View>
        </Animated.View>

        {/* All Scores */}
        <Text style={styles.sectionTitle}>All Role Scores</Text>
        <View style={styles.scoresContainer}>
          {['da', 'ds', 'de'].map((role) => {
            const config = getRoleConfig(role);
            const score = result.scores[role];
            const isTopScore = role === result.bestFit;

            return (
              <View
                key={role}
                style={[
                  styles.scoreCard,
                  isTopScore && {
                    borderColor: config.color,
                    borderWidth: 2,
                  },
                ]}
              >
                <View style={styles.scoreCardHeader}>
                  <View
                    style={[
                      styles.scoreCardIcon,
                      { backgroundColor: config.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={config.icon}
                      size={20}
                      color={config.color}
                    />
                  </View>
                  <Text style={styles.scoreCardTitle}>{config.name}</Text>
                  {isTopScore && (
                    <View style={styles.topBadge}>
                      <Ionicons name="star" size={12} color={COLORS.warning} />
                    </View>
                  )}
                </View>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      {
                        width: `${score.percentage}%`,
                        backgroundColor: config.color,
                      },
                    ]}
                  />
                </View>
                <View style={styles.scoreCardFooter}>
                  <Text style={[styles.scoreValue, { color: config.color }]}>
                    {score.percentage}%
                  </Text>
                  <Text style={styles.suitabilitySmall}>
                    {score.suitability.level}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* XP Earned */}
        {result.xpEarned > 0 && (
          <View style={styles.xpCard}>
            <Ionicons name="star" size={24} color={COLORS.warning} />
            <Text style={styles.xpText}>+{result.xpEarned} XP Earned!</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Compare Roles"
            onPress={() => navigation.navigate('CareerCompare', { result })}
            style={styles.actionButton}
          />
          <Button
            title="Retake Test"
            variant="outline"
            onPress={() => navigation.replace('CareerTest')}
            style={styles.actionButton}
          />
          <Button
            title="Back to Home"
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
  bestFitCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  bestFitLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  bestFitIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bestFitRole: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bestFitDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  bestFitScore: {
    marginBottom: 16,
  },
  suitabilityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suitabilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 16,
  },
  scoresContainer: {
    gap: 12,
  },
  scoreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scoreCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  topBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  suitabilitySmall: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  xpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  xpText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 8,
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
});

export default CareerResultScreen;
