import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Codebasics</Text>
      <Text style={styles.subtitle}>Assess</Text>
      <ActivityIndicator
        size="large"
        color={COLORS.primary}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 24,
    color: COLORS.primaryLight,
    marginTop: 5,
  },
  loader: {
    marginTop: 30,
  },
});

export default SplashScreen;
