import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

// Auth Screen
import { LoginScreen } from '../screens/Auth/LoginScreen';

// Agent Screens
import { AgentDashboardScreen } from '../screens/Dashboard/AgentDashboardScreen';
import { BeatCollectionScreen } from '../screens/Collection/BeatCollectionScreen';
import { CollectPaymentScreen } from '../screens/Collection/CollectPaymentScreen';
import { ReceiptViewScreen } from '../screens/Collection/ReceiptViewScreen';
import { CustomerDetailScreen } from '../screens/Customers/CustomerDetailScreen';
import { AttendanceScreen } from '../screens/Attendance/AttendanceScreen';
import { CashHandoverScreen } from '../screens/Handover/CashHandoverScreen';

// Admin Screens
import { AdminDashboardScreen } from '../screens/Admin/AdminDashboardScreen';
import { AdminLoanListScreen } from '../screens/Admin/AdminLoanListScreen';
import { AdminCustomerListScreen } from '../screens/Admin/AdminCustomerListScreen';
import { AdminAgentListScreen } from '../screens/Admin/AdminAgentListScreen';
import { AdminCreateAgentScreen } from '../screens/Admin/AdminCreateAgentScreen';
import { AdminRouteAreaScreen } from '../screens/Admin/AdminRouteAreaScreen';
import { AdminCreateRouteScreen } from '../screens/Admin/AdminCreateRouteScreen';
import { AdminExpenseScreen } from '../screens/Admin/AdminExpenseScreen';
import { AdminDisburseLoanScreen } from '../screens/Admin/AdminDisburseLoanScreen';
import { AdminCreateCustomerScreen } from '../screens/Admin/AdminCreateCustomerScreen';
import { AdminEditCustomerScreen } from '../screens/Admin/AdminEditCustomerScreen';
import { AdminHandoverScreen } from '../screens/Admin/AdminHandoverScreen';
import { AdminAgentCollectionScreen } from '../screens/Admin/AdminAgentCollectionScreen';
import { LoanLedgerScreen } from '../screens/Admin/LoanLedgerScreen';

// Icons
import {
  LayoutDashboard,
  MapPin,
  Clock,
  Banknote,
  Receipt,
  Users,
  WalletCards,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Agent Bottom Tabs
function AgentBottomTabs() {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 18 : 12);
  const totalBarHeight = 58 + safeBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: Colors.surfaceBorder,
          borderTopWidth: 1,
          height: totalBarHeight,
          paddingBottom: safeBottom,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: Colors.primaryLight,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="AgentDashboard"
        component={AgentDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <LayoutDashboard size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BeatCollection"
        component={BeatCollectionScreen}
        options={{
          tabBarLabel: 'Beat Route',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MapPin size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CashHandover"
        component={CashHandoverScreen}
        options={{
          tabBarLabel: 'Handover',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Banknote size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Clock size={size - 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Admin Bottom Tabs (Executive P&L, Loans, Customers, Agents & Security, Beats)
function AdminBottomTabs() {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 18 : 12);
  const totalBarHeight = 58 + safeBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: Colors.surfaceBorder,
          borderTopWidth: 1,
          height: totalBarHeight,
          paddingBottom: safeBottom,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: Colors.primaryLight,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <LayoutDashboard size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminCollectionsTab"
        component={AdminAgentCollectionScreen}
        options={{
          tabBarLabel: 'Collections',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Receipt size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminLoansTab"
        component={AdminLoanListScreen}
        options={{
          tabBarLabel: 'Loans',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <WalletCards size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminCustomersTab"
        component={AdminCustomerListScreen}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Users size={size - 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AdminAgentsTab"
        component={AdminAgentListScreen}
        options={{
          tabBarLabel: 'Agents',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <ShieldCheck size={size - 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {/* Base Tabs based on Role */}
            {isAdmin ? (
              <Stack.Screen name="AdminTabs" component={AdminBottomTabs} />
            ) : (
              <Stack.Screen name="AgentTabs" component={AgentBottomTabs} />
            )}

            {/* Common & Admin Stack Screens */}
            <Stack.Screen name="AdminAgentCollections" component={AdminAgentCollectionScreen} />
            <Stack.Screen name="AdminDisburseLoan" component={AdminDisburseLoanScreen} />
            <Stack.Screen name="AdminCreateCustomer" component={AdminCreateCustomerScreen} />
            <Stack.Screen name="AdminEditCustomer" component={AdminEditCustomerScreen} />
            <Stack.Screen name="AdminAgents" component={AdminAgentListScreen} />
            <Stack.Screen name="AdminCreateAgent" component={AdminCreateAgentScreen} />
            <Stack.Screen name="AdminLoans" component={AdminLoanListScreen} />
            <Stack.Screen name="AdminCustomers" component={AdminCustomerListScreen} />
            <Stack.Screen name="AdminRouteArea" component={AdminRouteAreaScreen} />
            <Stack.Screen name="AdminCreateRoute" component={AdminCreateRouteScreen} />
            <Stack.Screen name="AdminExpenses" component={AdminExpenseScreen} />
            <Stack.Screen name="AdminHandovers" component={AdminHandoverScreen} />

            {/* Loan Ledger Detail */}
            <Stack.Screen name="LoanLedger" component={LoanLedgerScreen} />

            {/* Collection & Detail Stack Screens */}
            <Stack.Screen name="CollectPayment" component={CollectPaymentScreen} />
            <Stack.Screen name="ReceiptView" component={ReceiptViewScreen} />
            <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
            <Stack.Screen name="CashHandover" component={CashHandoverScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
