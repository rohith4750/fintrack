import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ApiService } from '../../services/api';
import { openGoogleMapsNavigation } from '../../services/location';
import { Customer, Route, Loan } from '../../types';
import {
  Search,
  Plus,
  Users,
  Phone,
  MapPin,
  ShieldCheck,
  Edit2,
  Trash2,
  ChevronRight,
  Navigation2,
  Banknote,
} from 'lucide-react-native';

export const AdminCustomerListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [custList, routeList, loanList] = await Promise.all([
      ApiService.getCustomers(),
      ApiService.getRoutes(),
      ApiService.getLoans(),
    ]);
    setCustomers(custList);
    setRoutes(routeList);
    setLoans(loanList);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredCustomers = customers.filter((c) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        c.fullName.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRouteId !== 'ALL' && c.routeId !== selectedRouteId) return false;
    return true;
  });

  const handleDeleteCustomer = (customer: Customer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.fullName} (${customer.customerCode})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await ApiService.deleteCustomer(customer.id);
            setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
            Alert.alert('Deleted', `${customer.fullName} has been removed.`);
          },
        },
      ]
    );
  };

  const handleCall = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`);
  };

  const handleNavigate = (customer: Customer) => {
    openGoogleMapsNavigation(
      customer.latitude,
      customer.longitude,
      customer.fullName,
      customer.address
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Customer Directory"
        subtitle={`${customers.length} Registered Borrowers`}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminCreateCustomer')}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        }
      />

      {/* Search & Route Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, code, phone, address..."
            placeholderTextColor={Colors.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setSelectedRouteId('ALL')}
            style={[styles.filterChip, selectedRouteId === 'ALL' && styles.filterChipActive]}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedRouteId === 'ALL' && styles.filterChipTextActive,
              ]}
            >
              All Routes
            </Text>
          </TouchableOpacity>

          {routes.map((r) => {
            const isSel = selectedRouteId === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setSelectedRouteId(r.id)}
                style={[styles.filterChip, isSel && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterChipText, isSel && styles.filterChipTextActive]}
                  numberOfLines={1}
                >
                  {r.code}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.customerCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('CustomerDetail', {
                  customerId: item.id,
                  customerCode: item.customerCode,
                })
              }
              style={styles.cardMain}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>
                    {item.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.headerInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.customerName}>{item.fullName}</Text>
                    <View style={styles.kycBadge}>
                      <ShieldCheck size={12} color={Colors.success} />
                      <Text style={styles.kycText}>KYC</Text>
                    </View>
                  </View>
                  <Text style={styles.customerCode}>
                    {item.customerCode} • {item.phone}
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.textSecondary} />
              </View>

              <View style={styles.addressBox}>
                <MapPin size={13} color={Colors.textMuted} />
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.landmark ? `${item.landmark} • ` : ''}{item.address}, {item.city}
                </Text>
              </View>

              <View style={styles.financialStats}>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Active Loans</Text>
                  <Text style={styles.statVal}>{item.totalLoans || 1}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Loan Amount</Text>
                  <Text style={styles.statVal}>
                    ₹{(item.activeLoanAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>Total Outstanding</Text>
                  <Text style={[styles.statVal, { color: Colors.warning }]}>
                    ₹{(item.totalOutstanding || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Quick Action Bar (Collect, Call, Map Navigate, Edit, Delete) */}
            <View style={styles.cardActions}>
              {(() => {
                const activeLoan = loans.find(
                  (l) =>
                    (l.customerId === item.id || l.customerCode === item.customerCode || l.customerId === item.customerCode) &&
                    l.outstandingBalance > 0 &&
                    l.status !== 'CLOSED'
                );
                if (!activeLoan) return null;
                return (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CollectPayment', {
                        loanId: activeLoan.id,
                        customerId: item.id,
                        loan: activeLoan,
                      })
                    }
                    style={[styles.actionBtn, { backgroundColor: '#10B981', borderColor: 'transparent' }]}
                  >
                    <Banknote size={13} color="#FFF" />
                    <Text style={[styles.actionBtnText, { color: '#FFF', fontWeight: '700' }]}>Collect</Text>
                  </TouchableOpacity>
                );
              })()}

              <TouchableOpacity
                onPress={() => handleCall(item.phone)}
                style={styles.actionBtn}
              >
                <Phone size={13} color={Colors.primaryLight} />
                <Text style={styles.actionBtnText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigate(item)}
                style={styles.actionBtn}
              >
                <Navigation2 size={13} color="#3B82F6" />
                <Text style={[styles.actionBtnText, { color: '#3B82F6' }]}>Map</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('AdminEditCustomer', { customer: item })}
                style={styles.actionBtn}
              >
                <Edit2 size={13} color={Colors.warning} />
                <Text style={[styles.actionBtnText, { color: Colors.warning }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteCustomer(item)}
                style={styles.actionBtn}
              >
                <Trash2 size={13} color={Colors.danger} />
                <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  customerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardMain: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kycText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.success,
  },
  customerCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  addressText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  financialStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: Colors.surfaceBorder,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryLight,
  },
});
