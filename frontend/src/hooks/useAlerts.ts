// hooks/useAlerts.ts
import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";

export interface AlertItem {
  id: string;
  symbol: string;
  type: 'price' | 'change' | 'volume';
  condition: 'above' | 'below';
  value: number;
  active: boolean;
  triggered: boolean;
  triggeredAt?: number;
  createdAt: number;
}

export interface AlertHistoryItem {
  id: string;
  alertId: string;
  symbol: string;
  type: 'price' | 'change' | 'volume';
  condition: 'above' | 'below';
  value: number;
  triggeredAt: number;
  price: number;
}

export const useAlerts = () => {
  const { userId, isSignedIn } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>([]);
  
  // Load alerts from localStorage
  useEffect(() => {
    if (isSignedIn && userId) {
      // Load alerts
      const localAlerts = localStorage.getItem(`alerts_${userId}`);
      if (localAlerts) {
        try {
          setAlerts(JSON.parse(localAlerts));
        } catch (e) {
          console.error('Failed to parse alerts from localStorage', e);
          setAlerts([]);
        }
      }
      
      // Load alert history
      const localHistory = localStorage.getItem(`alert_history_${userId}`);
      if (localHistory) {
        try {
          setAlertHistory(JSON.parse(localHistory));
        } catch (e) {
          console.error('Failed to parse alert history from localStorage', e);
          setAlertHistory([]);
        }
      }
    }
  }, [userId, isSignedIn]);
  
  // Save alerts to localStorage
  const saveAlerts = (items: AlertItem[]) => {
    if (isSignedIn && userId) {
      localStorage.setItem(`alerts_${userId}`, JSON.stringify(items));
      setAlerts(items);
    }
  };
  
  // Save alert history to localStorage
  const saveAlertHistory = (items: AlertHistoryItem[]) => {
    if (isSignedIn && userId) {
      localStorage.setItem(`alert_history_${userId}`, JSON.stringify(items));
      setAlertHistory(items);
    }
  };
  
  // Create a new alert
  const createAlert = (
    symbol: string, 
    type: 'price' | 'change' | 'volume', 
    condition: 'above' | 'below', 
    value: number
  ) => {
    if (!isSignedIn) return null;
    
    const newAlert: AlertItem = {
      id: `${symbol}_${type}_${Date.now()}`,
      symbol,
      type,
      condition,
      value,
      active: true,
      triggered: false,
      createdAt: Date.now()
    };
    
    const newAlerts = [...alerts, newAlert];
    saveAlerts(newAlerts);
    return newAlert;
  };
  
  // Update alert status (active/inactive)
  const updateAlertStatus = (alertId: string, active: boolean) => {
    if (!isSignedIn) return false;
    
    const newAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, active } : alert
    );
    
    saveAlerts(newAlerts);
    return true;
  };
  
  // Delete an alert
  const deleteAlert = (alertId: string) => {
    if (!isSignedIn) return false;
    
    const newAlerts = alerts.filter(alert => alert.id !== alertId);
    saveAlerts(newAlerts);
    return true;
  };
  
  // Trigger an alert and add to history
  const triggerAlert = (alertId: string, price: number) => {
    if (!isSignedIn) return false;
    
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    // Update alert triggered status
    const triggeredAt = Date.now();
    const newAlerts = alerts.map(a => 
      a.id === alertId ? { ...a, triggered: true, triggeredAt } : a
    );
    saveAlerts(newAlerts);
    
    // Add to history
    const historyItem: AlertHistoryItem = {
      id: `history_${Date.now()}`,
      alertId,
      symbol: alert.symbol,
      type: alert.type,
      condition: alert.condition,
      value: alert.value,
      triggeredAt,
      price
    };
    
    const newHistory = [historyItem, ...alertHistory];
    saveAlertHistory(newHistory);
    return true;
  };
  
  // Get active alerts
  const getActiveAlerts = () => {
    return alerts.filter(alert => alert.active);
  };
  
  return {
    alerts,
    alertHistory,
    createAlert,
    updateAlertStatus,
    deleteAlert,
    triggerAlert,
    getActiveAlerts
  };
};