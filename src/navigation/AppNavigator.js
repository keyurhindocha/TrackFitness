import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/theme';

import WorkoutsScreen from '../screens/WorkoutsScreen';
import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProgressDetailScreen from '../screens/ProgressDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CheatScreen from '../screens/CheatScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const WorkoutsStack = createNativeStackNavigator();
const ProgressStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.surface,
  },
  headerShadowVisible: false,
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  contentStyle: { backgroundColor: COLORS.background },
};

function WorkoutsNavigator() {
  return (
    <WorkoutsStack.Navigator screenOptions={stackScreenOptions}>
      <WorkoutsStack.Screen
        name="WorkoutsList"
        component={WorkoutsScreen}
        options={({ navigation }) => ({
          title: 'Workouts',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ),
        })}
      />
      <WorkoutsStack.Screen
        name="LogWorkout"
        component={LogWorkoutScreen}
        options={({ route }) => ({ title: route.params?.workout ? 'Edit Workout' : 'New Workout' })}
      />
      <WorkoutsStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Data & Backup' }}
      />
    </WorkoutsStack.Navigator>
  );
}

function ProgressNavigator() {
  return (
    <ProgressStack.Navigator screenOptions={stackScreenOptions}>
      <ProgressStack.Screen
        name="ProgressList"
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <ProgressStack.Screen
        name="ProgressDetail"
        component={ProgressDetailScreen}
        options={({ route }) => ({ title: route.params.exerciseName })}
      />
    </ProgressStack.Navigator>
  );
}

const TAB_ICONS = {
  Workouts: 'barbell-outline',
  Progress: 'trending-up-outline',
  Calendar: 'calendar-outline',
  'Cheat Log': 'pizza-outline',
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 6,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={24} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Workouts" component={WorkoutsNavigator} />
      <Tab.Screen name="Progress" component={ProgressNavigator} />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.surface },
          headerShadowVisible: false,
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        }}
      />
      <Tab.Screen
        name="Cheat Log"
        component={CheatScreen}
        options={{
          headerShown: true,
          title: 'Cheat Log',
          headerStyle: { backgroundColor: COLORS.surface },
          headerShadowVisible: false,
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        }}
      />
    </Tab.Navigator>
  );
}
