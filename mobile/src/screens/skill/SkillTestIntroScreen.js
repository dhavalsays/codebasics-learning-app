import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import Button from '../../components/Button';
import useTestStore from '../../store/testStore';

const SkillTestIntroScreen = ({ navigation, route }) => {
  const { test } = route.params;
  const { startSkillTest, isLoading } = useTestStore();

  const handleStartTest = async () => {
    const result = await startSkillTest(test.id);
    if (result.success) {
      navigation.replace('SkillTest', {
        test,
        attemptId: result.data.attemptId,
        questions: result.data.questions,
      });
    }
  };

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      easy: { color: COLORS.success, icon: 'leaf' },
      medium: { color: COLORS.warning, icon: 'flame' },
      hard: { color: COLORS.error, icon: 'flash' },
    };
    return configs[difficulty] || configs.medium;
  };

  const difficultyConfig = getDifficultyConfig(test.difficulty);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{test.name}</Text>
          <Text style={styles.description}>{test.description}</Text>
        </View>

        {/* Test Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="help-circle" size={24} color={COLORS.info} />
            <Text style={styles.infoValue}>{test.questionCount}</Text>
            <Text style={styles.infoLabel}>Questions</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color={COLORS.warning} />
            <Text style={styles.infoValue}>{test.durationMinutes}</Text>
            <Text style={styles.infoLabel}>Minutes</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons
              name={difficultyConfig.icon}
              size={24}
              color={difficultyConfig.color}
            />
            <Text
              style={[styles.infoValue, { color: difficultyConfig.color }]}
            >
              {test.difficulty}
            </Text>
            <Text style={styles.infoLabel}>Difficulty</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <View style={styles.instructionItem}>
            <View style={styles.instructionBullet}>
              <Text style={styles.bulletText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Answer all {test.questionCount} multiple choice questions
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionBullet}>
              <Text style={styles.bulletText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              You have {test.durationMinutes} minutes to complete the test
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionBullet}>
              <Text style={styles.bulletText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Each correct answer is worth points based on difficulty
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionBullet}>
              <Text style={styles.bulletText}>4</Text>
            </View>
            <Text style={styles.instructionText}>
              You cannot go back once you answer a question
            </Text>
          </View>
        </View>

        {/* XP Info */}
        <View style={styles.xpInfo}>
          <Ionicons name="star" size={20} color={COLORS.warning} />
          <Text style={styles.xpText}>
            Earn up to <Text style={styles.xpHighlight}>{test.questionCount * 10} XP</Text> by
            completing this test!
          </Text>
        </View>

        {/* Passing Score */}
        <View style={styles.passingInfo}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.passingText}>
            Passing score: <Text style={styles.passingHighlight}>{test.passingScore || 70}%</Text>
          </Text>
        </View>

        <View style={styles.bottomSection}>
          <Button
            title="Start Test"
            onPress={handleStartTest}
            loading={isLoading}
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
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  xpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  xpText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  xpHighlight: {
    fontWeight: '700',
    color: COLORS.warning,
  },
  passingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  passingText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
  passingHighlight: {
    fontWeight: '700',
    color: COLORS.success,
  },
  bottomSection: {
    paddingTop: 8,
  },
});

export default SkillTestIntroScreen;
