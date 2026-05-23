import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, spacing, fontSize, radius } from '../theme/colors';

const { width } = Dimensions.get('window');

const TAB_ICONS: Record<string, { icon: string; label: string }> = {
  Home: { icon: '⌂', label: 'Home' },
  Schedule: { icon: '✚', label: 'Meds' },
  Analytics: { icon: '◈', label: 'Stats' },
  Settings: { icon: '☰', label: 'Profile' },
};

export default function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const tabWidth = width / state.routes.length;
  
  // Animated value for the indicator position
  const translateX = useRef(new Animated.Value(0)).current;
  
  // Scale animation for the active icon
  const scaleAnimations = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;
  
  // Opacity animation for labels
  const opacityAnimations = useRef(
    state.routes.map(() => new Animated.Value(0.7))
  ).current;

  useEffect(() => {
    // Animate indicator position (centered under the icon)
    Animated.spring(translateX, {
      toValue: state.index * tabWidth + tabWidth / 2 - 2,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    // Animate scale for each tab
    scaleAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: state.index === index ? 1.15 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    });

    // Animate label opacity
    opacityAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: state.index === index ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={styles.container}>
      {/* Background with rounded top corners */}
      <View style={styles.background}>
        {/* Animated indicator background */}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{ translateX }],
            },
          ]}
        />

        {/* Tab buttons */}
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const tabInfo = TAB_ICONS[route.name] || { icon: '•', label: route.name };

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.iconContainer,
                    {
                      transform: [{ scale: scaleAnimations[index] }],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.icon,
                      isFocused && styles.iconActive,
                    ]}
                    allowFontScaling={false}
                  >
                    {tabInfo.icon}
                  </Text>
                </Animated.View>
                <Animated.Text
                  style={[
                    styles.label,
                    {
                      opacity: opacityAnimations[index],
                      color: isFocused ? colors.light.primary : colors.light.gray,
                    },
                  ]}
                >
                  {tabInfo.label}
                </Animated.Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  background: {
    backgroundColor: colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    paddingTop: 8,
    shadowColor: colors.light.foreground,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: 4,
    backgroundColor: colors.light.primary,
    borderRadius: 2,
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
    color: colors.light.gray,
    fontWeight: '400',
  },
  iconActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    marginTop: 4,
  },
});
