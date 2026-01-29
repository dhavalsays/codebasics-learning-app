import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import useAuthStore from '../store/authStore';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import CareerTestIntroScreen from '../screens/career/CareerTestIntroScreen';
import CareerTestScreen from '../screens/career/CareerTestScreen';
import CareerResultScreen from '../screens/career/CareerResultScreen';
import CareerCompareScreen from '../screens/career/CareerCompareScreen';

// Skill Test Screens
import SkillTestListScreen from '../screens/skill/SkillTestListScreen';
import SkillTestIntroScreen from '../screens/skill/SkillTestIntroScreen';
import SkillTestScreen from '../screens/skill/SkillTestScreen';
import SkillResultScreen from '../screens/skill/SkillResultScreen';
import PracticeModeScreen from '../screens/skill/PracticeModeScreen';

// Profile & Gamification Screens
import ProfileScreen from '../screens/ProfileScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import BadgesScreen from '../screens/BadgesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tests':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tests" component={SkillTestListScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Career Test Flow */}
      <Stack.Screen name="CareerTestIntro" component={CareerTestIntroScreen} />
      <Stack.Screen name="CareerTest" component={CareerTestScreen} />
      <Stack.Screen name="CareerResult" component={CareerResultScreen} />
      <Stack.Screen name="CareerCompare" component={CareerCompareScreen} />

      {/* Skill Test Flow */}
      <Stack.Screen name="SkillTestIntro" component={SkillTestIntroScreen} />
      <Stack.Screen name="SkillTest" component={SkillTestScreen} />
      <Stack.Screen name="SkillResult" component={SkillResultScreen} />
      <Stack.Screen name="PracticeMode" component={PracticeModeScreen} />

      {/* Other Screens */}
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuthStore();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
