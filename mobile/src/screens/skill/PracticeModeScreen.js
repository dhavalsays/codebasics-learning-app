import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import useTestStore from '../../store/testStore';
import Button from '../../components/Button';

const PracticeModeScreen = ({ navigation, route }) => {
  const initialTopic = route.params?.topic || null;
  const { fetchPracticeQuestions, submitPracticeAnswer, isLoading } = useTestStore();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0 });

  const topics = ['Python', 'SQL', 'Excel', 'Statistics', 'ML Basics', 'Data Cleaning'];
  const difficulties = ['easy', 'medium', 'hard'];

  useEffect(() => {
    if (selectedTopic) {
      loadQuestion();
    }
  }, [selectedTopic, selectedDifficulty]);

  const loadQuestion = async () => {
    const result = await fetchPracticeQuestions(selectedTopic, 1, selectedDifficulty);
    if (result.success && result.data.length > 0) {
      setCurrentQuestion(result.data[0]);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setAnswerResult(null);
    }
  };

  const handleAnswerSelect = (optionKey) => {
    if (!isAnswered) {
      setSelectedAnswer(optionKey);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      Alert.alert('Select an Answer', 'Please select an option');
      return;
    }

    const result = await submitPracticeAnswer(currentQuestion.id, selectedAnswer);
    if (result.success) {
      setAnswerResult(result.data);
      setIsAnswered(true);
      setStats((prev) => ({
        correct: prev.correct + (result.data.isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: result.data.isCorrect ? prev.streak + 1 : 0,
      }));
    }
  };

  const handleNextQuestion = () => {
    loadQuestion();
  };

  const getOptionStyle = (optionKey) => {
    if (!isAnswered) {
      return selectedAnswer === optionKey ? styles.optionSelected : {};
    }

    const isCorrect = optionKey === answerResult?.correctAnswer?.toLowerCase();
    const isUserSelection = optionKey === selectedAnswer;

    if (isCorrect) {
      return styles.optionCorrect;
    }
    if (isUserSelection && !isCorrect) {
      return styles.optionIncorrect;
    }
    return {};
  };

  const getOptionIcon = (optionKey) => {
    if (!isAnswered) return null;

    const isCorrect = optionKey === answerResult?.correctAnswer?.toLowerCase();
    const isUserSelection = optionKey === selectedAnswer;

    if (isCorrect) {
      return <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />;
    }
    if (isUserSelection && !isCorrect) {
      return <Ionicons name="close-circle" size={24} color={COLORS.error} />;
    }
    return null;
  };

  // Topic Selection Screen
  if (!selectedTopic) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Practice Mode</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.topicScrollContent}>
          <Text style={styles.selectTitle}>Select a Topic</Text>
          <Text style={styles.selectSubtitle}>
            Choose a topic to practice questions
          </Text>

          <View style={styles.topicGrid}>
            {topics.map((topic, index) => (
              <TouchableOpacity
                key={topic}
                style={styles.topicCard}
                onPress={() => setSelectedTopic(topic)}
              >
                <Ionicons
                  name={getTopicIcon(topic)}
                  size={32}
                  color={COLORS.primary}
                />
                <Text style={styles.topicCardText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.difficultyTitle}>Select Difficulty (Optional)</Text>
          <View style={styles.difficultyRow}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyChip,
                  selectedDifficulty === diff && styles.difficultyChipSelected,
                ]}
                onPress={() =>
                  setSelectedDifficulty(selectedDifficulty === diff ? null : diff)
                }
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    selectedDifficulty === diff && styles.difficultyChipTextSelected,
                  ]}
                >
                  {diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Question Screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedTopic(null)}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark" size={16} color={COLORS.success} />
            <Text style={styles.statText}>{stats.correct}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={16} color={COLORS.warning} />
            <Text style={styles.statText}>{stats.streak}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.topicBadge}>
        <Text style={styles.topicBadgeText}>{selectedTopic}</Text>
        {selectedDifficulty && (
          <Text style={styles.difficultyBadgeText}> • {selectedDifficulty}</Text>
        )}
      </View>

      {currentQuestion ? (
        <ScrollView
          style={styles.questionScroll}
          contentContainerStyle={styles.questionContent}
        >
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

          <View style={styles.optionsContainer}>
            {['a', 'b', 'c', 'd'].map((key) => {
              const optionText = currentQuestion[`option${key.toUpperCase()}`];
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.optionCard, getOptionStyle(key)]}
                  onPress={() => handleAnswerSelect(key)}
                  disabled={isAnswered}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionLetter}>
                      <Text style={styles.optionLetterText}>{key.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.optionText}>{optionText}</Text>
                  </View>
                  {getOptionIcon(key)}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Explanation */}
          {isAnswered && answerResult?.explanation && (
            <View style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Ionicons name="bulb" size={20} color={COLORS.warning} />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>
                {answerResult.explanation}
              </Text>
            </View>
          )}

          {/* XP Earned */}
          {isAnswered && answerResult?.xpEarned > 0 && (
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={18} color={COLORS.warning} />
              <Text style={styles.xpBadgeText}>+{answerResult.xpEarned} XP</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      )}

      <View style={styles.footer}>
        {!isAnswered ? (
          <Button
            title="Check Answer"
            onPress={handleSubmitAnswer}
            loading={isLoading}
            disabled={!selectedAnswer}
          />
        ) : (
          <Button title="Next Question" onPress={handleNextQuestion} />
        )}
      </View>
    </SafeAreaView>
  );
};

const getTopicIcon = (topic) => {
  const icons = {
    Python: 'logo-python',
    SQL: 'server',
    Excel: 'grid',
    Statistics: 'stats-chart',
    'ML Basics': 'hardware-chip',
    'Data Cleaning': 'construct',
  };
  return icons[topic] || 'code-slash';
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
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  topicScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  selectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  selectSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  topicCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  difficultyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  difficultyChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  difficultyChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  difficultyChipTextSelected: {
    color: COLORS.white,
  },
  topicBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.primaryLight + '20',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  topicBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  difficultyBadgeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  questionScroll: {
    flex: 1,
  },
  questionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  optionCorrect: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '15',
  },
  optionIncorrect: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '15',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  explanationCard: {
    backgroundColor: COLORS.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning + '20',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 16,
  },
  xpBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default PracticeModeScreen;
