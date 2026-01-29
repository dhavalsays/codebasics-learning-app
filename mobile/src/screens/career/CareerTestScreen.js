import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import useTestStore from '../../store/testStore';
import Button from '../../components/Button';

const CareerTestScreen = ({ navigation }) => {
  const {
    careerQuestions,
    currentQuestionIndex,
    answers,
    fetchCareerQuestions,
    setAnswer,
    submitCareerTest,
    resetCareerTest,
    isLoading,
  } = useTestStore();

  const [selectedOption, setSelectedOption] = useState(null);
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchCareerQuestions();
    return () => {
      // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progress, {
      toValue: (currentQuestionIndex + 1) / (careerQuestions?.length || 1),
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Reset selection when moving to new question
    const previousAnswer = answers[careerQuestions?.[currentQuestionIndex]?.id];
    setSelectedOption(previousAnswer || null);
  }, [currentQuestionIndex, careerQuestions]);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleNext = async () => {
    if (!selectedOption) {
      Alert.alert('Select an Option', 'Please select an answer to continue');
      return;
    }

    const question = careerQuestions[currentQuestionIndex];
    setAnswer(question.id, selectedOption);

    if (currentQuestionIndex < careerQuestions.length - 1) {
      // Move to next question
      useTestStore.setState({
        currentQuestionIndex: currentQuestionIndex + 1,
      });
    } else {
      // Submit test
      const result = await submitCareerTest();
      if (result.success) {
        navigation.replace('CareerResult', { result: result.data });
      } else {
        Alert.alert('Error', result.error || 'Failed to submit test');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      useTestStore.setState({
        currentQuestionIndex: currentQuestionIndex - 1,
      });
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
            resetCareerTest();
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!careerQuestions || careerQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </SafeAreaView>
    );
  }

  const question = careerQuestions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.questionCounter}>
          {currentQuestionIndex + 1} / {careerQuestions.length}
        </Text>
        <View style={{ width: 24 }} />
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

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.questionText}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedOption === option.id && styles.optionCardSelected,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.optionRadio,
                selectedOption === option.id && styles.optionRadioSelected,
              ]}
            >
              {selectedOption === option.id && (
                <View style={styles.optionRadioInner} />
              )}
            </View>
            <Text
              style={[
                styles.optionText,
                selectedOption === option.id && styles.optionTextSelected,
              ]}
            >
              {option.optionText}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={
              currentQuestionIndex === 0 ? COLORS.textLight : COLORS.text
            }
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <Button
          title={
            currentQuestionIndex === careerQuestions.length - 1
              ? 'Submit'
              : 'Next'
          }
          onPress={handleNext}
          loading={isLoading}
          style={styles.nextButton}
          size="medium"
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
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 30,
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionRadioSelected: {
    borderColor: COLORS.primary,
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: '500',
    color: COLORS.primary,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 4,
  },
  navButtonTextDisabled: {
    color: COLORS.textLight,
  },
  nextButton: {
    minWidth: 120,
  },
});

export default CareerTestScreen;
