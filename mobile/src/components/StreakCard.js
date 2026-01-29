import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const StreakCard = ({ currentStreak, longestStreak }) => {
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (currentStreak >= 30) return "Incredible! You're on fire!";
    if (currentStreak >= 7) return "Great consistency!";
    if (currentStreak >= 3) return "Keep it going!";
    return "Nice start!";
  };

  return (
    <View style={styles.container}>
      <View style={styles.flameContainer}>
        <Ionicons name="flame" size={48} color={COLORS.warning} />
        <Text style={styles.streakCount}>{currentStreak}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Day Streak</Text>
        <Text style={styles.message}>{getStreakMessage()}</Text>
        <Text style={styles.longest}>
          Longest streak: {longestStreak} days
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '15',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  flameContainer: {
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginTop: -8,
  },
  content: {
    marginLeft: 20,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  longest: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },
});

export default StreakCard;
