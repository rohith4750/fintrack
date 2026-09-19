import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { apiClient } from '../../services/api';
import { Expense } from '../../types';
import { Receipt, Plus, Trash2, Calendar, FileText } from 'lucide-react-native';

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-01',
    voucherNumber: 'EXP-2026-001',
    category: 'FUEL_CONVEYANCE',
    title: 'Field Fuel Allowance',
    amount: 1200,
    paymentMode: 'CASH',
    paidTo: 'HPCL Auto Fuel Station',
    remarks: 'Field collection motorcycle fuel allowance',
    expenseDate: '2026-09-20',
    recordedBy: 'Suresh Varma',
  },
  {
    id: 'EXP-02',
    voucherNumber: 'EXP-2026-002',
    category: 'PRINTING_STATIONERY',
    title: 'Thermal Paper Rolls',
    amount: 650,
    paymentMode: 'CASH',
    paidTo: 'Sri Balaji Book Depo',
    remarks: 'Thermal print rolls and loan application forms',
    expenseDate: '2026-09-19',
    recordedBy: 'Rajesh Kumar (Admin)',
  },
  {
    id: 'EXP-03',
    voucherNumber: 'EXP-2026-003',
    category: 'TEA_REFRESHMENT',
    title: 'Review Refreshments',
    amount: 320,
    paymentMode: 'CASH',
    paidTo: 'Hotel Srinivasa',
    remarks: 'Branch evening review tea and snacks',
    expenseDate: '2026-09-18',
    recordedBy: 'Rajesh Kumar (Admin)',
  },
];

type ExpenseCategory = Expense['category'];

const EXPENSE_CATEGORIES: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Fuel', value: 'FUEL_CONVEYANCE' },
  { label: 'Stationery', value: 'PRINTING_STATIONERY' },
  { label: 'Refreshment', value: 'TEA_REFRESHMENT' },
  { label: 'Office Rent', value: 'OFFICE_RENT' },
  { label: 'Staff Salary', value: 'STAFF_SALARY' },
  { label: 'Miscellaneous', value: 'MISCELLANEOUS' },
];

export const AdminExpenseScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Form states
  const [category, setCategory] = useState<ExpenseCategory>('FUEL_CONVEYANCE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [remarks, setRemarks] = useState('');

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0 || !paidTo.trim() || !title.trim()) {
      Alert.alert('Validation Error', 'Please enter Title, Amount, and Paid To recipient.');
      return;
    }

    const newExpense: Expense = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      voucherNumber: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
      category,
      title: title.trim(),
      amount: amt,
      paymentMode: 'CASH',
      paidTo: paidTo.trim(),
      remarks: remarks.trim() || `${category} voucher`,
      expenseDate: '2026-09-20',
      recordedBy: 'Rajesh Kumar (Admin)',
    };

    try {
      await apiClient.post('/expenses', newExpense);
    } catch (e) {}

    setExpenses((prev) => [newExpense, ...prev]);
    setShowAddExpense(false);
    setTitle('');
    setAmount('');
    setPaidTo('');
    setRemarks('');
    Alert.alert('Voucher Saved', `Expense voucher for ₹${amt} recorded.`);
  };

  const handleDeleteExpense = (exp: Expense) => {
    Alert.alert(
      'Delete Voucher',
      `Delete ${exp.voucherNumber} (₹${exp.amount}) paid to ${exp.paidTo}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setExpenses((prev) => prev.filter((item) => item.id !== exp.id));
            try {
              await apiClient.delete(`/expenses?id=${exp.id}`);
            } catch (e) {}
            Alert.alert('Deleted', 'Expense voucher removed.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Expenses & Accounts"
        subtitle={`Total Recorded: ₹${totalExpenseAmount.toLocaleString('en-IN')}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowAddExpense(!showAddExpense)}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFF" />
          </TouchableOpacity>
        }
      />

      {/* Category Filter Pills */}
      <View style={styles.categoryFilterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSel = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setSelectedCategory(cat.value)}
                style={[styles.catPill, isSel && styles.catPillActive]}
              >
                <Text style={[styles.catPillText, isSel && styles.catPillTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Create Expense Voucher Form */}
        {showAddExpense && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Branch Expense Voucher</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryPicker}>
                {(
                  [
                    { label: 'Fuel', val: 'FUEL_CONVEYANCE' },
                    { label: 'Stationery', val: 'PRINTING_STATIONERY' },
                    { label: 'Refreshment', val: 'TEA_REFRESHMENT' },
                    { label: 'Rent', val: 'OFFICE_RENT' },
                    { label: 'Salary', val: 'STAFF_SALARY' },
                    { label: 'Misc', val: 'MISCELLANEOUS' },
                  ] as const
                ).map((c) => {
                  const isSel = category === c.val;
                  return (
                    <TouchableOpacity
                      key={c.val}
                      onPress={() => setCategory(c.val as ExpenseCategory)}
                      style={[styles.pickerBtn, isSel && styles.pickerBtnActive]}
                    >
                      <Text style={[styles.pickerBtnText, isSel && styles.pickerBtnTextActive]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title / Subject *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Daily Motorcycle Fuel Allowance"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount (₹) *</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="e.g. 1500"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Paid To (Vendor / Person) *</Text>
              <TextInput
                style={styles.input}
                value={paidTo}
                onChangeText={setPaidTo}
                placeholder="e.g. Petrol Bunk / Office Landlord"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Remarks / Notes</Text>
              <TextInput
                style={styles.input}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Details of the expense"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.formBtnRow}>
              <TouchableOpacity
                onPress={() => setShowAddExpense(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCreateExpense} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save Voucher</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Expenses List */}
        <Text style={styles.sectionTitle}>Expense Transactions</Text>

        {filteredExpenses.map((exp) => (
          <View key={exp.id} style={styles.expenseCard}>
            <View style={styles.expenseTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.expensePayee}>{exp.title}</Text>
                <Text style={styles.expenseMeta}>
                  {exp.voucherNumber} • {exp.expenseDate} • Paid to {exp.paidTo}
                </Text>
              </View>
              <Text style={styles.expenseAmount}>₹{exp.amount.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.expenseDescRow}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{exp.category.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.expenseDesc} numberOfLines={2}>
                {exp.remarks || 'No remarks provided'}
              </Text>
            </View>

            <View style={styles.cardActionRow}>
              <TouchableOpacity
                onPress={() => handleDeleteExpense(exp)}
                style={styles.deleteBtn}
              >
                <Trash2 size={14} color={Colors.danger} />
                <Text style={styles.deleteBtnText}>Delete Voucher</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  categoryFilterRow: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  catPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 12,
    height: 44,
    color: Colors.text,
    fontSize: 13,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pickerBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pickerBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  expenseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  expenseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 8,
  },
  expensePayee: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  expenseMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.danger,
  },
  expenseDescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  catBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
  },
  expenseDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardActionRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    paddingVertical: 8,
    alignItems: 'flex-end',
    paddingRight: 14,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
  },
});
