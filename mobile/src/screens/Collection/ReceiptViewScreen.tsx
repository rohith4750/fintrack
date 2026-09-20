import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { HeaderBar } from '../../components/HeaderBar';
import { ThermalReceiptPreview } from '../../components/ThermalReceiptPreview';
import { PrinterService } from '../../services/printerService';
import { Collection, Customer, Loan } from '../../types';
import { Printer, Share2, Check, ArrowRight, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export const ReceiptViewScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { collection, loan, customer } = route.params as {
    collection: Collection;
    loan?: Loan;
    customer?: Customer;
  };

  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  const handleReturn = () => {
    if (isAdmin) {
      navigation.navigate('AdminLoans');
    } else {
      navigation.navigate('BeatCollection');
    }
  };

  const handlePrintBluetooth = async () => {
    setIsPrinting(true);
    try {
      const res = await PrinterService.printViaBluetooth(collection, loan, customer);
      setPrintSuccess(true);
      Alert.alert('Print Successful', res.message);
    } catch (e) {
      Alert.alert('Printer Error', 'Could not connect to Bluetooth Thermal Printer.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = PrinterService.generateWhatsAppMessage(collection);
    const phone = customer?.phone?.replace(/[^0-9]/g, '');
    const url = phone
      ? `whatsapp://send?phone=${phone}&text=${text}`
      : `whatsapp://send?text=${text}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp Error', 'Could not open WhatsApp on device.');
    });
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Payment Receipt"
        subtitle={`Voucher #${collection.receiptNumber}`}
        showBack
        onBack={handleReturn}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Banner */}
        <View style={styles.successBanner}>
          <View style={styles.checkBadge}>
            <Check size={18} color="#FFF" />
          </View>
          <View style={styles.successTextGroup}>
            <Text style={styles.successTitle}>Collection Recorded Successfully</Text>
            <Text style={styles.successSub}>
              ₹{collection.amount.toLocaleString('en-IN')} received via {collection.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Paper Thermal Receipt Component */}
        <ThermalReceiptPreview collection={collection} loan={loan} />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Bluetooth Thermal Print Button */}
          <TouchableOpacity
            onPress={handlePrintBluetooth}
            disabled={isPrinting}
            style={[styles.printBtn, printSuccess && styles.printBtnSuccess]}
          >
            {isPrinting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Printer size={18} color="#FFF" />
                <Text style={styles.printBtnText}>
                  {printSuccess ? 'Printed (Print Again)' : 'Print Thermal Slip (ESC/POS)'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* WhatsApp Share Button */}
          <TouchableOpacity onPress={handleWhatsAppShare} style={styles.whatsappBtn}>
            <MessageCircle size={18} color="#FFF" />
            <Text style={styles.whatsappBtnText}>Send Receipt via WhatsApp</Text>
          </TouchableOpacity>

          {/* Return Button */}
          <TouchableOpacity
            onPress={handleReturn}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>
              {isAdmin ? 'Back to Loan Management' : 'Next Borrower on Beat'}
            </Text>
            <ArrowRight size={16} color={Colors.primaryLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTextGroup: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.successLight,
  },
  successSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 20,
    gap: 10,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
  },
  printBtnSuccess: {
    backgroundColor: Colors.primaryDark,
  },
  printBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 12,
    height: 50,
  },
  whatsappBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: 12,
    height: 48,
    marginTop: 4,
  },
  doneBtnText: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
