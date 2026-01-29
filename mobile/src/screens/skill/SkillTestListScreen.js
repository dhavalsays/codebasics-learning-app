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
import { COLORS } from '../../constants/theme';
import useTestStore from '../../store/testStore';

const SkillTestListScreen = ({ navigation }) => {
  const { skillTests, fetchSkillTests, isLoading } = useTestStore();

  useEffect(() => {
    fetchSkillTests();
  }, []);

  const getTestIcon = (testName) => {
    const name = testName.toLowerCase();
    if (name.includes('python')) return 'logo-python';
    if (name.includes('sql')) return 'server';
    if (name.includes('excel')) return 'grid';
    if (name.includes('tableau') || name.includes('power bi')) return 'bar-chart';
    return 'code-slash';
  };

  const getTestColor = (index) => {
    const colors = [
      COLORS.roleDA,
      COLORS.roleDS,
      COLORS.roleDE,
      COLORS.info,
      COLORS.warning,
    ];
    return colors[index % colors.length];
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: COLORS.success,
      medium: COLORS.warning,
      hard: COLORS.error,
    };
    return colors[difficulty] || COLORS.textSecondary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Skill Tests</Text>
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => navigation.navigate('PracticeMode')}
        >
          <Ionicons name="flash" size={20} color={COLORS.primary} />
          <Text style={styles.practiceButtonText}>Practice</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchSkillTests} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by Topic</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {['Python', 'SQL', 'Excel', 'Statistics', 'ML Basics'].map(
              (topic, index) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.categoryChip,
                    { borderColor: getTestColor(index) },
                  ]}
                  onPress={() =>
                    navigation.navigate('PracticeMode', { topic })
                  }
                >
                  <Text
                    style={[styles.categoryChipText, { color: getTestColor(index) }]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>
        </View>

        {/* Available Tests */}
        <Text style={styles.sectionTitle}>Available Tests</Text>
        {skillTests?.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>No tests available yet</Text>
          </View>
        ) : (
          skillTests?.map((test, index) => {
            const color = getTestColor(index);
            return (
              <TouchableOpacity
                key={test.id}
                style={styles.testCard}
                onPress={() =>
                  navigation.navigate('SkillTestIntro', { test })
                }
              >
                <View
                  style={[styles.testIcon, { backgroundColor: color + '20' }]}
                >
                  <Ionicons
                    name={getTestIcon(test.name)}
                    size={28}
                    color={color}
                  />
                </View>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testDescription} numberOfLines={2}>
                    {test.description}
                  </Text>
                  <View style={styles.testMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="help-circle-outline"
                        size={14}
                        color={COLORS.textLight}
                      />
                      <Text style={styles.metaText}>
                        {test.questionCount} questions
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={COLORS.textLight}
                      />
                      <Text style={styles.metaText}>
                        {test.durationMinutes} min
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.difficultyBadge,
                        {
                          backgroundColor:
                            getDifficultyColor(test.difficulty) + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyText,
                          { color: getDifficultyColor(test.difficulty) },
                        ]}
                      >
                        {test.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            );
          })
        )}

        {/* Recent Attempts */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Your Recent Tests
        </Text>
        <TouchableOpacity
          style={styles.viewHistoryButton}
          onPress={() => {
            // Navigate to history or show modal
          }}
        >
          <Ionicons name="time" size={20} color={COLORS.primary} />
          <Text style={styles.viewHistoryText}>View Test History</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  practiceButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  testMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewHistoryText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SkillTestListScreen;
