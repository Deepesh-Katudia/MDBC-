import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { StatusBar } from 'expo-status-bar';

import Home from './app/Home';
import Import from './app/Import';
import MappingPreview from './app/MappingPreview';
import ConvertValidate from './app/ConvertValidate';
import Risks from './app/Risks';
import History from './app/History';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

function AppNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
            headerTintColor: theme.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
            cardStyle: {
              backgroundColor: theme.background,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Import"
            component={Import}
            options={{ title: 'Import Data' }}
          />
          <Stack.Screen
            name="MappingPreview"
            component={MappingPreview}
            options={{ title: 'Mapping Preview' }}
          />
          <Stack.Screen
            name="ConvertValidate"
            component={ConvertValidate}
            options={{ title: 'Convert & Validate' }}
          />
          <Stack.Screen
            name="Risks"
            component={Risks}
            options={{ title: 'Risk Analysis' }}
          />
          <Stack.Screen
            name="History"
            component={History}
            options={{ title: 'History' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
