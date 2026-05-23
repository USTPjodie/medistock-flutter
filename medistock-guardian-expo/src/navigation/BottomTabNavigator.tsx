import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MedsScreen from '../screens/MedsScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddMedicationModal from '../components/AddMedicationModal';

export type TabParamList = {
  Home: undefined;
  Meds: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const { width } = Dimensions.get('window');

// Custom Tab Bar with Central Plus Button
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors, theme } = useTheme();
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  
  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlusPress = () => {
    animatePress();
    setShowAddMedicationModal(true);
  };

  // Filter out the AddMedication route from tabs
  const tabRoutes = state.routes.filter((route: any) => route.name !== 'AddMedication');
  const tabWidth = width / 4; // 4 tabs

  return (
    <View style={[styles.container, { backgroundColor: colors.tabBar }]}>
      {/* Tab Bar Background */}
      <View style={[styles.tabBar, { 
        backgroundColor: colors.tabBar,
        borderTopColor: colors.border,
      }]}>
        {/* Left Tabs (Home, Meds) */}
        <View style={styles.leftTabs}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);
            
            // Only show first 2 tabs on left
            if (index >= 2) return null;

            const iconName = route.name === 'Home' 
              ? (isFocused ? 'home' : 'home-outline')
              : (isFocused ? 'medical' : 'medical-outline');

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName as any}
                  size={24}
                  color={isFocused ? colors.primary : colors.tabBarInactive}
                />
                <Text style={[styles.tabLabel, { 
                  color: isFocused ? colors.primary : colors.tabBarInactive,
                }]}>
                  {route.name === 'Meds' ? 'Meds' : route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Center Plus Button */}
        <View style={styles.plusButtonContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={handlePlusPress}
              style={[styles.plusButton, { 
                backgroundColor: colors.plusButton,
                shadowColor: colors.shadow,
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Right Tabs (Stats, Profile) */}
        <View style={styles.rightTabs}>
          {state.routes.slice(2).map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

            const iconName = route.name === 'Stats'
              ? (isFocused ? 'bar-chart' : 'bar-chart-outline')
              : (isFocused ? 'person' : 'person-outline');

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={iconName as any}
                  size={24}
                  color={isFocused ? colors.primary : colors.tabBarInactive}
                />
                <Text style={[styles.tabLabel, { 
                  color: isFocused ? colors.primary : colors.tabBarInactive,
                }]}>
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Add Medication Modal */}
      <AddMedicationModal
        visible={showAddMedicationModal}
        onClose={() => setShowAddMedicationModal(false)}
      />
    </View>
  );
}

export default function BottomTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Meds" component={MedsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingTop: 8,
  },
  leftTabs: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rightTabs: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  plusButtonContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
