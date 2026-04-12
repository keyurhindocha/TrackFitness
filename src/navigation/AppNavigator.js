import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

import WorkoutsScreen from '../screens/WorkoutsScreen';
import LogWorkoutScreen from '../screens/LogWorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProgressDetailScreen from '../screens/ProgressDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import CheatDaysScreen from '../screens/CheatDaysScreen';

const Tab = createBottomTabNavigator();
const WorkoutsStack = createNativeStackNavigator();
const ProgressStack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: COLORS.background },
};

function WorkoutsNavigator() {
  return (
    <WorkoutsStack.Navigator screenOptions={stackScreenOptions}>
      <WorkoutsStack.Screen
        name="WorkoutsList"
        component={WorkoutsScreen}
        options={{ title: 'Workouts' }}
      />
      <WorkoutsStack.Screen
        name="LogWorkout"
        component={LogWorkoutScreen}
        options={{ title: 'Log Workout' }}
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

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Workouts: 'barbell-outline',
            Progress: 'trending-up-outline',
            Calendar: 'calendar-outline',
            'Cheat Days': 'pizza-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Workouts" component={WorkoutsNavigator} />
      <Tab.Screen name="Progress" component={ProgressNavigator} />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ headerShown: true, headerStyle: { backgroundColor: COLORS.surface }, headerTintColor: COLORS.text, headerTitleStyle: { fontWeight: '700' } }}
      />
      <Tab.Screen
        name="Cheat Days"
        component={CheatDaysScreen}
        options={{ headerShown: true, headerStyle: { backgroundColor: COLORS.surface }, headerTintColor: COLORS.text, headerTitleStyle: { fontWeight: '700' } }}
      />
    </Tab.Navigator>
  );
}
