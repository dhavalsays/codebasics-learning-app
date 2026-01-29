import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import useTestStore from '../../store/testStore';
import Button from '../../components/Button';

const SkillTestScreen = ({ navigation, route }) => {
  const { test, attemptId, questions } = route.params;
  const { submitSkillTest, isLoading } = useTestStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(test.durationMinutes * 60);
  const [progress] = useState(new Animated.Value(0));

  const timerRef = useRef(null);

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (currentIndex + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const handleTimeUp = () => {
    Alert.alert(
      'Time Up!',
      'Your time has expired. Submitting your answers...',
      [{ text: 'OK', onPress: handleSubmit }]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 60) return COLORS.error;
    if (timeRemaining <= 300) return COLORS.warning;
    return COLORS.text;
  };

  const handleOptionSelect = (optionKey) => {
    setSelectedOption(optionKey);
  };

  const handleNext = () => {
    if (!selectedOption) {
      Alert.alert('Select an Answer', 'Please select an option to continue');
      return;
    }

    const currentQuestion = questions[currentIndex];
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOption,
    };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers = answers) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Format answers for submission
    const formattedAnswers = Object.entries(finalAnswers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      })
    );

    const result = await submitSkillTest(attemptId, formattedAnswers);
    if (result.success) {
      navigation.replace('SkillResult', { result: result.data, test });
    } else {
      Alert.alert('Error', result.error || 'Failed to submit test');
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Test',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  const question = questions[currentIndex];
  const options = [
    { key: 'a', text: question.optionA },
    { key: 'b', text: question.optionB },
    { key: 'c', text: question.optionC },
    { key: 'd', text: question.optionD },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={18} color={getTimeColor()} />
          <Text style={[styles.timerText, { color: getTimeColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
        <Text style={styles.questionCounter}>
          {currentIndex + 1}/{questions.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={styles.questionContainer}>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{question.difficulty}</Text>
          </View>
          <Text style={styles.questionText}>{question.questionText}</Text>
          {question.topic && (
            <View style={styles.topicBadge}>
              <Text style={styles.topicText}>{question.topic}</Text>
            </View>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionCard,
                selectedOption === option.key && styles.optionCardSelected,
              ]}
              onPress={() => handleOptionSelect(option.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionLetter,
                  selectedOption === option.key && styles.optionLetterSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionLetterText,
                    selectedOption === option.key &&
                      styles.optionLetterTextSelected,
                  ]}
                >
                  {option.key.toUpperCase()}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option.key && styles.optionTextSelected,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Button
          title={currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
          onPress={handleNext}
          loading={isLoading}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  questionContainer: {
    marginBottom: 24,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.info + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.info,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 28,
  },
  topicBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
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
  optionLetterSelected: {
    backgroundColor: COLORS.primary,
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionLetterTextSelected: {
    color: COLORS.white,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: '500',
  },
  navigation: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    width: '100%',
  },
});

export default SkillTestScreen;
