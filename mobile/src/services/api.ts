import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Collection, Customer, Loan, Route, User, AgentAttendanceRecord, CashHandoverRecord } from '../types';

// Default Next.js Backend API URLs (Localhost with ADB USB reverse & LAN IP)
export const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';
export const LAN_API_BASE_URL = 'http://192.168.31.178:3001/api';

const STORAGE_KEYS = {
  API_BASE_URL: '@fintrack_api_base_url',
  AUTH_USER: '@fintrack_auth_user',
  AUTH_TOKEN: '@fintrack_auth_token',
  OFFLINE_COLLECTIONS: '@fintrack_offline_collections_queue',
  CACHED_ROUTES: '@fintrack_cached_routes',
  CACHED_LOANS: '@fintrack_cached_loans',
  CACHED_CUSTOMERS: '@fintrack_cached_customers',
  CACHED_AGENTS: '@fintrack_cached_agents',
  CACHED_EXPENSES: '@fintrack_cached_expenses',
};

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor to inject dynamic Base URL and Bearer Token
apiClient.interceptors.request.use(async (config: any) => {
  const customBaseUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_BASE_URL);
  if (customBaseUrl) {
    config.baseURL = customBaseUrl;
  } else {
    config.baseURL = DEFAULT_API_BASE_URL;
  }

  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback attempt to LAN IP if localhost fails
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout')
    ) {
      if (!originalRequest._retryWithLan) {
        originalRequest._retryWithLan = true;
        try {
          const customUrl = await AsyncStorage.getItem(STORAGE_KEYS.API_BASE_URL);
          const nextBaseUrl = customUrl === LAN_API_BASE_URL ? DEFAULT_API_BASE_URL : LAN_API_BASE_URL;
          originalRequest.baseURL = nextBaseUrl;
          await AsyncStorage.setItem(STORAGE_KEYS.API_BASE_URL, nextBaseUrl);
          return await axios(originalRequest);
        } catch (retryErr) {
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const ApiService = {
  // Agent / Admin PIN Authentication (Dynamic DB lookup)
  login: async (pinOrId: string, pinPass?: string): Promise<{ success: boolean; user?: User; token?: string }> => {
    const cleanPin = (pinOrId || pinPass || '').trim();

    try {
      const response = await apiClient.post('/auth/login', { userId: cleanPin, pin: cleanPin }, { timeout: 4000 });
      if (response.data?.success && response.data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.data.user));
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token || 'fintrack-token');
        return response.data;
      }
    } catch (e: any) {
      console.log('Online login failed, checking offline cached agents...', e?.message);
    }

    // Offline fallback strictly from cached database records
    try {
      const cachedAgentsStr = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_AGENTS);
      if (cachedAgentsStr) {
        const cachedAgents: User[] = JSON.parse(cachedAgentsStr);
        const dynamicUser = cachedAgents.find((a) => a.pin === cleanPin || a.loginId === cleanPin || a.userId === cleanPin || a.phone === cleanPin);
        if (dynamicUser) {
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(dynamicUser));
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'offline-session-token');
          return { success: true, user: dynamicUser, token: 'offline-session-token' };
        }
      }
    } catch (err) {}



    return { success: false };
  },

  // Get Agents Roster (Live database with offline cache)
  getAgents: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get('/agents');
      if (res.data?.success && Array.isArray(res.data.agents)) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_AGENTS, JSON.stringify(res.data.agents));
        return res.data.agents;
      }
    } catch (e: any) {
      console.log('Failed to fetch live agents, reading cache:', e?.message);
    }

    const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_AGENTS);
    if (cached) return JSON.parse(cached);
    return [];
  },

  // Add / Provision New Agent
  addAgent: async (agentData: Omit<User, 'id'>): Promise<User> => {
    try {
      const res = await apiClient.post('/agents', agentData);
      if (res.data?.success && res.data.agent) {
        const existing = await ApiService.getAgents();
        const updated = [res.data.agent, ...existing.filter((a) => a.userId !== res.data.agent.userId)];
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_AGENTS, JSON.stringify(updated));
        return res.data.agent;
      }
    } catch (e: any) {
      console.error('API addAgent error:', e?.message);
    }

    // Local fallback
    const existing = await ApiService.getAgents();
    const newId = `USR-${String(existing.length + 2).padStart(2, '0')}`;
    const newAgent: User = {
      ...agentData,
      id: newId,
      userId: newId,
      recoveryEfficiency: 95.0,
      todayCollected: 0,
      attendanceStatus: 'ON_FIELD',
    };
    const updated = [newAgent, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_AGENTS, JSON.stringify(updated));
    return newAgent;
  },

  // Update Agent
  updateAgentCredentials: async (agentId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      await apiClient.put(`/agents?id=${agentId}`, updates);
    } catch (e: any) {
      console.error('API updateAgent error:', e?.message);
    }

    const existing = await ApiService.getAgents();
    const updated = existing.map((a) => (a.id === agentId || a.userId === agentId ? { ...a, ...updates } : a));
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_AGENTS, JSON.stringify(updated));
    return true;
  },

  // Delete Agent
  deleteAgent: async (agentId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/agents?id=${agentId}`);
    } catch (e: any) {
      console.error('API deleteAgent error:', e?.message);
    }

    const existing = await ApiService.getAgents();
    const updated = existing.filter((a) => a.id !== agentId && a.userId !== agentId);
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_AGENTS, JSON.stringify(updated));
    return true;
  },

  // Get Customers (Live database with offline cache)
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const res = await apiClient.get('/customers');
      if (res.data?.success && Array.isArray(res.data.customers)) {
        const mapped = res.data.customers.map((c: any) => ({
          id: c.id || c.customerCode,
          customerCode: c.customerCode,
          fullName: c.name || c.fullName,
          phone: c.mobileNumber || c.phone,
          aadhaarNumber: c.aadhaarNumber,
          address: c.address || '',
          city: c.city || 'Rajahmundry',
          areaId: c.areaId || 'AREA-01',
          areaName: c.area?.name || c.areaName || 'Rajahmundry Urban',
          routeId: c.routeId || 'RT-01',
          routeName: c.route?.name || c.routeName || 'Main Road Beat',
          assignedAgentId: c.assignedAgentId || 'USR-02',
          totalLoans: c.totalLoans || (c.loans?.length ?? 0),
          activeLoanAmount: c.activeLoanAmount || 0,
          totalOutstanding: c.totalOutstanding || 0,
          kycStatus: c.status === 'ACTIVE' ? 'VERIFIED' : 'PENDING',
          latitude: c.latitude ? Number(c.latitude) : undefined,
          longitude: c.longitude ? Number(c.longitude) : undefined,
          landmark: c.landmark || undefined,
          locationAddress: c.locationAddress || c.address || undefined,
        }));
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CUSTOMERS, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e: any) {
      console.log('Failed to fetch live customers, reading cache:', e?.message);
    }

    const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_CUSTOMERS);
    if (cached) return JSON.parse(cached);
    return [];
  },

  // Add Customer (with GPS coordinates to DB)
  addCustomer: async (customerData: Omit<Customer, 'id' | 'customerCode'>): Promise<Customer> => {
    try {
      const res = await apiClient.post('/customers', {
        name: customerData.fullName,
        mobileNumber: customerData.phone,
        aadhaarNumber: customerData.aadhaarNumber,
        address: customerData.address,
        areaId: customerData.areaId,
        routeId: customerData.routeId,
        latitude: customerData.latitude,
        longitude: customerData.longitude,
        landmark: customerData.landmark,
        locationAddress: customerData.locationAddress || customerData.address,
      });

      if (res.data?.success && res.data.customer) {
        const c = res.data.customer;
        const savedCustomer: Customer = {
          id: c.id || c.customerCode,
          customerCode: c.customerCode,
          fullName: c.name,
          phone: c.mobileNumber,
          aadhaarNumber: c.aadhaarNumber,
          address: c.address,
          city: customerData.city || 'Rajahmundry',
          areaId: c.areaId,
          areaName: c.area?.name || customerData.areaName || 'Rajahmundry Urban',
          routeId: c.routeId,
          routeName: c.route?.name || customerData.routeName || 'Main Road Beat',
          assignedAgentId: customerData.assignedAgentId || 'USR-02',
          totalLoans: c.totalLoans || 0,
          activeLoanAmount: c.activeLoanAmount || 0,
          totalOutstanding: c.totalOutstanding || 0,
          kycStatus: 'VERIFIED',
          latitude: c.latitude ? Number(c.latitude) : undefined,
          longitude: c.longitude ? Number(c.longitude) : undefined,
          landmark: c.landmark,
          locationAddress: c.locationAddress,
        };

        const existing = await ApiService.getCustomers();
        const updated = [savedCustomer, ...existing.filter((item) => item.customerCode !== savedCustomer.customerCode)];
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CUSTOMERS, JSON.stringify(updated));
        return savedCustomer;
      }
    } catch (e: any) {
      console.error('API addCustomer error:', e?.message);
    }

    const existing = await ApiService.getCustomers();
    const newCode = `CUST-${String(existing.length + 1001)}`;
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST-${Date.now().toString().slice(-4)}`,
      customerCode: newCode,
      totalLoans: 0,
      activeLoanAmount: 0,
      totalOutstanding: 0,
      kycStatus: 'VERIFIED',
    };

    const updated = [newCustomer, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CUSTOMERS, JSON.stringify(updated));
    return newCustomer;
  },

  // Update Customer & GPS Location
  updateCustomerGpsLocation: async (
    customerId: string,
    coords: { latitude: number; longitude: number; landmark?: string; locationAddress?: string }
  ): Promise<boolean> => {
    try {
      await apiClient.put(`/customers?id=${customerId}`, coords);
    } catch (e: any) {
      console.error('API updateCustomerGpsLocation error:', e?.message);
    }

    const existing = await ApiService.getCustomers();
    const updated = existing.map((c) =>
      c.id === customerId || c.customerCode === customerId
        ? {
            ...c,
            latitude: coords.latitude,
            longitude: coords.longitude,
            landmark: coords.landmark || c.landmark,
            locationAddress: coords.locationAddress || c.locationAddress,
          }
        : c
    );
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CUSTOMERS, JSON.stringify(updated));
    return true;
  },

  // Update Customer
  updateCustomer: async (customerId: string, updates: Partial<Customer>): Promise<boolean> => {
    try {
      await apiClient.put(`/customers?id=${customerId}`, updates);
    } catch (e: any) {
      console.error('API updateCustomer error:', e?.message);
    }

    const existing = await ApiService.getCustomers();
    const updated = existing.map((c) =>
      c.id === customerId || c.customerCode === customerId ? { ...c, ...updates } : c
    );
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CUSTOMERS, JSON.stringify(updated));
    return true;
  },

  // Delete Customer
  deleteCustomer: async (customerId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/customers?id=${customerId}`);
    } catch (e: any) {
      console.error('API deleteCustomer error:', e?.message);
    }

    const existing = await ApiService.getCustomers();
    const updated = existing.filter((c) => c.id !== customerId && c.customerCode !== customerId);
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_CUSTOMERS, JSON.stringify(updated));
    return true;
  },

  // Get Routes (Live database & offline fallback)
  getRoutes: async (): Promise<Route[]> => {
    try {
      const res = await apiClient.get('/routes');
      if (res.data?.success && Array.isArray(res.data.routes)) {
        const mapped = res.data.routes.map((r: any) => ({
          id: r.id || r.routeId,
          routeId: r.routeId,
          name: r.name,
          code: r.code,
          areaId: r.areaId || 'AREA-01',
          areaName: r.area?.name || 'Rajahmundry Urban',
          assignedAgentId: r.assignedAgentId || 'USR-02',
          assignedAgentName: r.assignedAgent?.name || 'Suresh Varma',
          collectionDay: r.collectionFrequency || 'Tuesday',
          totalCustomers: r.customers?.length || r.totalCustomers || 0,
          todayTarget: Number(r.todayTarget) || 25000,
          todayCollected: Number(r.todayCollected) || 0,
        }));
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_ROUTES, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e: any) {
      console.log('Failed to fetch live routes, reading cache:', e?.message);
    }

    const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_ROUTES);
    if (cached) return JSON.parse(cached);
    return [];
  },

  // Get Assigned Routes for Agent
  getAssignedRoutes: async (agentId?: string): Promise<Route[]> => {
    const allRoutes = await ApiService.getRoutes();
    if (!agentId || agentId === 'ALL') return allRoutes;
    return allRoutes.filter((r) => r.assignedAgentId === agentId || r.assignedAgentName?.includes(agentId));
  },

  // Get Assigned Loans for Agent
  getAssignedLoans: async (agentId?: string, routeId?: string): Promise<Loan[]> => {
    return ApiService.getLoans(agentId, routeId);
  },

  // Add Route
  addRoute: async (routeData: Omit<Route, 'id'>): Promise<Route> => {
    try {
      const res = await apiClient.post('/routes', {
        name: routeData.name,
        code: routeData.code,
        areaId: routeData.areaId,
        assignedAgentId: routeData.assignedAgentId,
        todayTarget: routeData.todayTarget,
      });
      if (res.data?.success && res.data.route) {
        const r = res.data.route;
        const newRoute: Route = {
          id: r.id || r.routeId,
          routeId: r.routeId,
          name: r.name,
          code: r.code,
          areaId: r.areaId,
          areaName: 'Rajahmundry Urban',
          assignedAgentId: r.assignedAgentId,
          assignedAgentName: 'Suresh Varma',
          collectionDay: r.collectionFrequency || 'Tuesday',
          totalCustomers: 0,
          todayTarget: Number(r.todayTarget) || 25000,
          todayCollected: 0,
        };
        const existing = await ApiService.getRoutes();
        const updated = [newRoute, ...existing.filter((item) => item.routeId !== newRoute.routeId)];
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_ROUTES, JSON.stringify(updated));
        return newRoute;
      }
    } catch (e: any) {
      console.error('API addRoute error:', e?.message);
    }

    const existing = await ApiService.getRoutes();
    const newRoute: Route = {
      ...routeData,
      id: `RT-${Date.now().toString().slice(-4)}`,
    };
    const updated = [newRoute, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_ROUTES, JSON.stringify(updated));
    return newRoute;
  },

  // Update Route
  updateRoute: async (routeId: string, updates: Partial<Route>): Promise<boolean> => {
    try {
      await apiClient.put(`/routes?id=${routeId}`, updates);
    } catch (e: any) {
      console.error('API updateRoute error:', e?.message);
    }

    const existing = await ApiService.getRoutes();
    const updated = existing.map((r) => (r.id === routeId || r.code === routeId ? { ...r, ...updates } : r));
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_ROUTES, JSON.stringify(updated));
    return true;
  },

  // Delete Route
  deleteRoute: async (routeId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/routes?id=${routeId}`);
    } catch (e: any) {
      console.error('API deleteRoute error:', e?.message);
    }

    const existing = await ApiService.getRoutes();
    const updated = existing.filter((r) => r.id !== routeId && r.code !== routeId);
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_ROUTES, JSON.stringify(updated));
    return true;
  },

  // Get Loans (Live database & offline fallback)
  getLoans: async (agentId?: string, routeId?: string): Promise<Loan[]> => {
    try {
      const url = agentId && agentId !== 'ALL' ? `/loans?agentId=${agentId}` : '/loans';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.loans)) {
        const mapped = res.data.loans.map((l: any) => ({
          id: l.id || l.loanNumber,
          loanNumber: l.loanNumber,
          customerId: l.customerId || l.customer?.id,
          customerCode: l.customer?.customerCode || l.customerId,
          customerName: l.customer?.name || l.customerName || 'Borrower',
          phone: l.customer?.mobileNumber || l.phone || '+91 98480 12345',
          principalAmount: Number(l.principalAmount),
          interestRate: Number(l.interestRatePercentage || l.interestRate || 14),
          interestAmount: Number(l.totalInterestAmount || 0),
          processingFee: 600,
          totalRepayableAmount: Number(l.totalRepayableAmount),
          installmentAmount: Number(l.installmentAmount),
          totalPaidAmount: Number(l.totalPaidAmount || 0),
          outstandingBalance: Number(l.outstandingBalance),
          loanType: l.loanType || 'WEEKLY',
          durationUnits: Number(l.durationUnits || 50),
          startDate: l.startDate || '2026-09-20',
          disbursementDate: l.disbursementDate || '2026-09-20',
          endDate: l.endDate || '2027-02-15',
          status: l.status || 'ACTIVE',
          areaId: l.customer?.areaId || 'AREA-01',
          areaName: l.customer?.area?.name || 'Rajahmundry Urban',
          routeId: l.routeId || 'RT-01',
          routeName: l.route?.name || 'Main Road Beat',
          agentId: l.agentId || 'USR-02',
          agentName: l.agent?.name || 'Suresh Varma',
          installments: l.installments,
        }));
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_LOANS, JSON.stringify(mapped));
        return routeId && routeId !== 'ALL' ? mapped.filter((item: Loan) => item.routeId === routeId) : mapped;
      }
    } catch (e: any) {
      console.log('Failed to fetch live loans, reading cache:', e?.message);
    }

    const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_LOANS);
    if (cached) {
      const allLoans: Loan[] = JSON.parse(cached);
      return routeId && routeId !== 'ALL' ? allLoans.filter((l) => l.routeId === routeId) : allLoans;
    }
    return [];
  },

  // Disburse Loan
  disburseLoan: async (loanData: any): Promise<Loan> => {
    try {
      const res = await apiClient.post('/loans', loanData);
      if (res.data?.success && res.data.loan) {
        const l = res.data.loan;
        const newLoan: Loan = {
          id: l.id || l.loanNumber,
          loanNumber: l.loanNumber,
          customerId: l.customerId,
          customerCode: l.customer?.customerCode || l.customerId,
          customerName: l.customer?.name || loanData.customerName || 'Borrower',
          phone: l.customer?.mobileNumber || loanData.phone || '+91 98480 12345',
          principalAmount: Number(l.principalAmount),
          interestRate: Number(l.interestRatePercentage || 14),
          interestAmount: Number(l.totalInterestAmount || 0),
          processingFee: 600,
          totalRepayableAmount: Number(l.totalRepayableAmount),
          installmentAmount: Number(l.installmentAmount),
          totalPaidAmount: 0,
          outstandingBalance: Number(l.outstandingBalance),
          loanType: l.loanType || 'WEEKLY',
          durationUnits: Number(l.durationUnits),
          startDate: l.startDate,
          disbursementDate: l.disbursementDate,
          endDate: l.endDate,
          status: 'ACTIVE',
          areaId: 'AREA-01',
          areaName: 'Rajahmundry Urban',
          routeId: l.routeId,
          routeName: l.route?.name || 'Main Road Beat',
          agentId: l.agentId || 'USR-02',
          agentName: l.agent?.name || 'Suresh Varma',
        };

        const existing = await ApiService.getLoans();
        const updated = [newLoan, ...existing];
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_LOANS, JSON.stringify(updated));
        return newLoan;
      }
    } catch (e: any) {
      console.error('API disburseLoan error:', e?.message);
    }

    const existing = await ApiService.getLoans();
    const newLoanNumber = `LN-2026-${String(existing.length + 101).padStart(4, '0')}`;
    const newLoan: Loan = {
      ...loanData,
      id: `LN-${Date.now().toString().slice(-4)}`,
      loanNumber: newLoanNumber,
      totalPaidAmount: 0,
      outstandingBalance: loanData.totalRepayableAmount,
      status: 'ACTIVE',
    };
    const updated = [newLoan, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_LOANS, JSON.stringify(updated));
    return newLoan;
  },

  // Update Loan
  updateLoan: async (loanId: string, updates: Partial<Loan>): Promise<boolean> => {
    try {
      await apiClient.put(`/loans?id=${loanId}`, updates);
    } catch (e: any) {
      console.error('API updateLoan error:', e?.message);
    }

    const existing = await ApiService.getLoans();
    const updated = existing.map((l) => (l.id === loanId || l.loanNumber === loanId ? { ...l, ...updates } : l));
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_LOANS, JSON.stringify(updated));
    return true;
  },

  // Delete Loan
  deleteLoan: async (loanId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/loans?id=${loanId}`);
    } catch (e: any) {
      console.error('API deleteLoan error:', e?.message);
    }

    const existing = await ApiService.getLoans();
    const updated = existing.filter((l) => l.id !== loanId && l.loanNumber !== loanId);
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_LOANS, JSON.stringify(updated));
    return true;
  },

  // Record Collection Payment
  recordPayment: async (paymentData: Omit<Collection, 'id' | 'receiptNumber' | 'time' | 'balanceAfterPayment'>): Promise<Collection> => {
    try {
      const res = await apiClient.post('/collections', paymentData);
      if (res.data?.success && res.data.collection) {
        return res.data.collection;
      }
    } catch (e: any) {
      console.error('API recordPayment error:', e?.message);
    }

    const receiptNumber = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const collection: Collection = {
      ...paymentData,
      id: `COL-${Date.now()}`,
      receiptNumber,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      balanceAfterPayment: Math.max(0, 50000 - paymentData.amount),
      isSynced: true,
    };
    return collection;
  },

  // Record Collection (alias)
  recordCollection: async (paymentData: any): Promise<Collection> => {
    return ApiService.recordPayment(paymentData);
  },

  // Update Loan Status
  updateLoanStatus: async (loanId: string, status: string): Promise<boolean> => {
    return ApiService.updateLoan(loanId, { status: status as any });
  },

  // Submit Attendance
  submitAttendance: async (attendanceData: any): Promise<any> => {
    try {
      const res = await apiClient.post('/agents', { type: 'ATTENDANCE', ...attendanceData });
      if (res.data?.success) return res.data.attendance;
    } catch (e: any) {
      console.log('Attendance submit offline');
    }
    return { id: `ATT-${Date.now()}`, ...attendanceData };
  },

  // Submit Cash Handover
  submitCashHandover: async (handoverData: any): Promise<any> => {
    try {
      const res = await apiClient.post('/expenses', {
        title: `Cash Handover from ${handoverData.agentName || 'Agent'}`,
        category: 'MISCELLANEOUS',
        amount: Number(handoverData.totalCashAmount) || 0,
        paidTo: handoverData.handedOverTo || 'Manager',
        paymentMethod: 'CASH',
        notes: `Total Collections: ₹${handoverData.totalCollections}, UPI: ₹${handoverData.totalUpiAmount}`,
      });
      if (res.data?.success) return res.data.expense;
    } catch (e: any) {
      console.log('Cash handover saved offline');
    }
    return { id: `HND-${Date.now()}`, ...handoverData };
  },

  // Get Today Collections
  getTodayCollections: async (agentId?: string): Promise<Collection[]> => {
    try {
      const res = await apiClient.get('/collections');
      if (res.data?.success && Array.isArray(res.data.collections)) {
        return res.data.collections;
      }
    } catch (e: any) {}
    return [];
  },

  // Get Expenses
  getExpenses: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get('/expenses');
      if (res.data?.success && Array.isArray(res.data.expenses)) {
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_EXPENSES, JSON.stringify(res.data.expenses));
        return res.data.expenses;
      }
    } catch (e: any) {
      console.log('Failed to fetch live expenses:', e?.message);
    }

    const cached = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_EXPENSES);
    if (cached) return JSON.parse(cached);
    return [];
  },

  // Add Expense
  addExpense: async (expenseData: any): Promise<any> => {
    try {
      const res = await apiClient.post('/expenses', expenseData);
      if (res.data?.success && res.data.expense) {
        const existing = await ApiService.getExpenses();
        const updated = [res.data.expense, ...existing];
        await AsyncStorage.setItem(STORAGE_KEYS.CACHED_EXPENSES, JSON.stringify(updated));
        return res.data.expense;
      }
    } catch (e: any) {
      console.error('API addExpense error:', e?.message);
    }

    const newExpense = {
      id: `VCH-${Date.now().toString().slice(-4)}`,
      voucherNumber: `VCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...expenseData,
    };
    const existing = await ApiService.getExpenses();
    const updated = [newExpense, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_EXPENSES, JSON.stringify(updated));
    return newExpense;
  },

  // Delete Expense
  deleteExpense: async (voucherId: string): Promise<boolean> => {
    const existing = await ApiService.getExpenses();
    const updated = existing.filter((e) => e.id !== voucherId && e.voucherNumber !== voucherId);
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_EXPENSES, JSON.stringify(updated));
    return true;
  },

  // Current Logged in User
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (userStr) return JSON.parse(userStr);
    } catch (e) {}
    return null;
  },

  // Sync Offline Collections Queue
  syncOfflineQueue: async (): Promise<number> => {
    try {
      const queueStr = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_COLLECTIONS);
      if (!queueStr) return 0;
      const queue: any[] = JSON.parse(queueStr);
      let count = 0;
      for (const item of queue) {
        try {
          await apiClient.post('/collections', item);
          count++;
        } catch (err) {}
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_COLLECTIONS);
      return count;
    } catch (e) {
      return 0;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
