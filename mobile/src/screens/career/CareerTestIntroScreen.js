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

const CareerTestIntroScreen = ({ navigation }) => {
  const roles = [
    {
      title: 'Data Analyst',
      description: 'Turn data into actionable business insights',
      icon: 'bar-chart',
      color: COLORS.roleDA,
    },
    {
      title: 'Data Scientist',
      description: 'Build ML models and solve complex problems',
      icon: 'flask',
      color: COLORS.roleDS,
    },
    {
      title: 'Data Engineer',
      description: 'Design data pipelines and infrastructure',
      icon: 'server',
      color: COLORS.roleDE,
    },
  ];

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
            <Ionicons name="compass" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Career Suitability Test</Text>
          <Text style={styles.subtitle}>
            Answer 12 questions to discover which data career path suits you best
          </Text>
        </View>

        <View style={styles.rolesSection}>
          <Text style={styles.sectionTitle}>Discover Your Best Fit</Text>
          {roles.map((role, index) => (
            <View key={index} style={styles.roleCard}>
              <View
                style={[styles.roleIcon, { backgroundColor: role.color + '20' }]}
              >
                <Ionicons name={role.icon} size={24} color={role.color} />
              </View>
              <View style={styles.roleContent}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <InfoItem icon="time" text="Takes about 5 minutes" />
          <InfoItem icon="analytics" text="Get personalized scores for each role" />
          <InfoItem icon="trophy" text="Earn XP and track your progress" />
          <InfoItem icon="refresh" text="Retake anytime to see your growth" />
        </View>

        <View style={styles.bottomPadding}>
          <Button
            title="Start Test"
            onPress={() => navigation.navigate('CareerTest')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ icon, text }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  rolesSection: {
    marginBottom: 32,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 12,
  },
  bottomPadding: {
    paddingBottom: 40,
  },
});

export default CareerTestIntroScreen;
