import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import useTestStore from '../../store/testStore';
import ScoreCircle from '../../components/ScoreCircle';

const { width } = Dimensions.get('window');

const CareerCompareScreen = ({ navigation, route }) => {
  const { careerTestHistory, fetchCareerHistory } = useTestStore();
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    if (route.params?.result) {
      setSelectedResult(route.params.result);
    } else {
      fetchCareerHistory().then(() => {
        if (careerTestHistory?.length > 0) {
          setSelectedResult(careerTestHistory[0]);
        }
      });
    }
  }, []);

  const roles = [
    {
      code: 'da',
      name: 'Data Analyst',
      shortName: 'DA',
      color: COLORS.roleDA,
      icon: 'bar-chart',
      skills: ['SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics'],
      focus: 'Business insights & reporting',
    },
    {
      code: 'ds',
      name: 'Data Scientist',
      shortName: 'DS',
      color: COLORS.roleDS,
      icon: 'flask',
      skills: ['Python', 'ML/AI', 'Statistics', 'Deep Learning', 'NLP'],
      focus: 'Predictive modeling & ML',
    },
    {
      code: 'de',
      name: 'Data Engineer',
      shortName: 'DE',
      color: COLORS.roleDE,
      icon: 'server',
      skills: ['Python', 'SQL', 'Spark', 'Airflow', 'Cloud'],
      focus: 'Data pipelines & infrastructure',
    },
  ];

  if (!selectedResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No career test results yet</Text>
          <TouchableOpacity
            style={styles.takeTestButton}
            onPress={() => navigation.navigate('CareerTestIntro')}
          >
            <Text style={styles.takeTestButtonText}>Take Career Test</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compare Roles</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Comparison */}
        <View style={styles.scoreComparison}>
          {roles.map((role) => {
            const score = selectedResult.scores?.[role.code]?.percentage || 0;
            const isTopScore = role.code === selectedResult.bestFit;

            return (
              <View key={role.code} style={styles.scoreItem}>
                <ScoreCircle
                  score={score}
                  size={90}
                  strokeWidth={8}
                  color={role.color}
                />
                <Text style={[styles.roleName, { color: role.color }]}>
                  {role.shortName}
                </Text>
                {isTopScore && (
                  <View style={styles.bestBadge}>
                    <Ionicons name="star" size={12} color={COLORS.warning} />
                    <Text style={styles.bestBadgeText}>Best</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Role Details */}
        <Text style={styles.sectionTitle}>Role Details</Text>
        {roles.map((role) => {
          const score = selectedResult.scores?.[role.code];
          const isTopScore = role.code === selectedResult.bestFit;

          return (
            <View
              key={role.code}
              style={[
                styles.roleCard,
                isTopScore && { borderColor: role.color, borderWidth: 2 },
              ]}
            >
              <View style={styles.roleCardHeader}>
                <View
                  style={[
                    styles.roleIcon,
                    { backgroundColor: role.color + '20' },
                  ]}
                >
                  <Ionicons name={role.icon} size={24} color={role.color} />
                </View>
                <View style={styles.roleCardInfo}>
                  <View style={styles.roleCardTitleRow}>
                    <Text style={styles.roleCardTitle}>{role.name}</Text>
                    {isTopScore && (
                      <View style={styles.topMatchBadge}>
                        <Text style={styles.topMatchText}>Top Match</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.roleCardFocus}>{role.focus}</Text>
                </View>
              </View>

              <View style={styles.roleCardScore}>
                <View style={styles.scoreBarContainer}>
                  <View
                    style={[
                      styles.scoreBar,
                      {
                        width: `${score?.percentage || 0}%`,
                        backgroundColor: role.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.scorePercent, { color: role.color }]}>
                  {score?.percentage || 0}%
                </Text>
              </View>

              <View style={styles.suitabilityRow}>
                <Text style={styles.suitabilityLabel}>Suitability:</Text>
                <Text
                  style={[
                    styles.suitabilityValue,
                    { color: role.color },
                  ]}
                >
                  {score?.suitability?.level || 'N/A'}
                </Text>
              </View>

              <View style={styles.skillsContainer}>
                <Text style={styles.skillsLabel}>Key Skills:</Text>
                <View style={styles.skillTags}>
                  {role.skills.map((skill, index) => (
                    <View
                      key={index}
                      style={[
                        styles.skillTag,
                        { backgroundColor: role.color + '15' },
                      ]}
                    >
                      <Text
                        style={[styles.skillTagText, { color: role.color }]}
                      >
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })}

        {/* Percentile Info */}
        {selectedResult.percentileRank && (
          <View style={styles.percentileCard}>
            <Ionicons name="people" size={24} color={COLORS.primary} />
            <View style={styles.percentileInfo}>
              <Text style={styles.percentileTitle}>Your Percentile</Text>
              <Text style={styles.percentileValue}>
                You scored higher than{' '}
                <Text style={styles.percentileHighlight}>
                  {selectedResult.percentileRank}%
                </Text>{' '}
                of test takers
              </Text>
            </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  takeTestButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  takeTestButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scoreComparison: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  scoreItem: {
    alignItems: 'center',
  },
  roleName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  bestBadgeText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '600',
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  roleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleCardInfo: {
    flex: 1,
  },
  roleCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  topMatchBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  topMatchText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
  roleCardFocus: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleCardScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scorePercent: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
  suitabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suitabilityLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  suitabilityValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  skillsContainer: {
    marginTop: 4,
  },
  skillsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  percentileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  percentileTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  percentileValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  percentileHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default CareerCompareScreen;
