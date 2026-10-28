import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Send,
  MessageCircle,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  CreditCard,
  Search,
  Bell,
  Clock,
  ExternalLink,
  X,
  History,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CreditCustomer, TrustLevel } from '../../types';

export const CreditTab: React.FC = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCustomerCredit,
    recordCustomerPayment,
    markCustomerFullyPaid,
    settings,
    t,
    language,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [creditActionModal, setCreditActionModal] = useState<{
    open: boolean;
    customer: CreditCustomer | null;
    mode: 'addCredit' | 'recordPayment';
    amount: string;
    noteOrItems: string;
  }>({
    open: false,
    customer: null,
    mode: 'addCredit',
    amount: '',
    noteOrItems: '',
  });

  const [historyModal, setHistoryModal] = useState<CreditCustomer | null>(null);
  const [remindAllConfirmOpen, setRemindAllConfirmOpen] = useState(false);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustItems, setNewCustItems] = useState('');
  const [newCustAmount, setNewCustAmount] = useState('');
  const [newCustDueDate, setNewCustDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newCustTrust, setNewCustTrust] = useState<TrustLevel>('Pays on time');

  // Stats
  const totalPendingAmount = customers.reduce((sum, c) => sum + c.amountDue, 0);
  const activeDuesCount = customers.filter((c) => c.amountDue > 0).length;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.itemsTaken.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newCustAmount) || 0;
    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      itemsTaken: newCustItems.trim() || 'Daily groceries',
      amountDue: amt,
      totalGiven: amt,
      dueDate: newCustDueDate,
      trustLevel: newCustTrust,
      history: [],
    });

    setAddCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustItems('');
    setNewCustAmount('');
  };

  const handleCreditActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditActionModal.customer) return;
    const amt = parseFloat(creditActionModal.amount);
    if (isNaN(amt) || amt <= 0) return;

    if (creditActionModal.mode === 'addCredit') {
      addCustomerCredit(
        creditActionModal.customer.id,
        amt,
        creditActionModal.noteOrItems || 'Additional goods'
      );
    } else {
      recordCustomerPayment(
        creditActionModal.customer.id,
        amt,
        creditActionModal.noteOrItems || 'Payment received'
      );
    }

    setCreditActionModal({
      open: false,
      customer: null,
      mode: 'addCredit',
      amount: '',
      noteOrItems: '',
    });
  };

  // Generate WhatsApp Reminder Link with customized language & UPI ID
  const getWhatsAppReminderUrl = (cust: CreditCustomer) => {
    let msg = '';
    const upiText = settings.upiId
      ? `\n\n💳 Pay easily via UPI ID: *${settings.upiId}*`
      : '';

    if (language === 'hi') {
      msg = `नमस्ते ${cust.name} जी! 🙏\n\n*${settings.shopName}* से विनम्र निवेदन है कि आपका कुल बकाया हिसाब *₹${cust.amountDue}* है।${upiText}\n\nकृपया सुविधानुसार भुगतान करने का कष्ट करें। आपके निरंतर सहयोग के लिए धन्यवाद! 💐`;
    } else if (language === 'mr') {
      msg = `नमस्कार ${cust.name}! 🙏\n\n*${settings.shopName}* कडून नम्र आठवण: आपली उधारी रक्कम *₹${cust.amountDue}* बाकी आहे. ${upiText}\n\nकृपया लवकरात लवकर जमा करावी ही विनंती. सहकार्याबद्दल धन्यवाद! 💐`;
    } else {
      msg = `Hello ${cust.name}! 🙏\n\nGentle reminder from *${settings.shopName}*: your pending credit balance is *₹${cust.amountDue}* for goods taken (${cust.itemsTaken}).${upiText}\n\nPlease settle at your convenience. Thank you for your continued patronage! 💐`;
    }

    const cleanPhone = cust.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91')
      ? cleanPhone
      : `91${cleanPhone}`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  // Generate SMS reminder link
  const getSmsReminderUrl = (cust: CreditCustomer) => {
    const upiText = settings.upiId ? ` Pay via UPI: ${settings.upiId}` : '';
    const body = `Namaste ${cust.name}, reminder from ${settings.shopName}: Pending balance is Rs ${cust.amountDue}.${upiText} Thank you.`;
    return `sms:${cust.phone}?body=${encodeURIComponent(body)}`;
  };

  const getTrustBadge = (trust: TrustLevel) => {
    switch (trust) {
      case 'Pays on time':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <ShieldCheck className="w-3 h-3" />
            <span>Pays on time ⭐</span>
          </span>
        );
      case 'Sometimes late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
            <AlertCircle className="w-3 h-3" />
            <span>Sometimes late ⚠️</span>
          </span>
        );
      case 'Often late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            <ShieldAlert className="w-3 h-3" />
            <span>Often late 🚨</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.credit.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.credit.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRemindAllConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
          >
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{t.credit.remindAll}</span>
          </button>

          <button
            onClick={() => setAddCustomerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm shadow-emerald-600/30 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.credit.addNewCustomer}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Header Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Pending */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-600/15">
          <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider block">
            {t.credit.totalDue}
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-2">
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-indigo-100/80 mt-1 block">
            Across {activeDuesCount} customer accounts
          </span>
        </div>

        {/* Weekly Reminder Schedule Box */}
        <div className="sm:col-span-2 p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Automated Reminder Broadcast
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Weekly Routine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            {t.credit.reminderSchedule}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span>Shop UPI Attached:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {settings.upiId || 'Not set (Add in settings)'}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.credit.searchCustomer}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-emerald-500 shadow-xs"
        />
      </div>

      {/* Profile-Style Customer Cards List */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            {t.credit.noCredit}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((cust) => {
            const isSettled = cust.amountDue <= 0;
            const initials = cust.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            return (
              <div
                key={cust.id}
                className={`p-5 rounded-3xl border transition-all duration-200 ${
                  isSettled
                    ? 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Header: Avatar, Name, Trust Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {cust.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{cust.phone}</span>
                      </p>
                    </div>
                  </div>

                  {getTrustBadge(cust.trustLevel)}
                </div>

                {/* Balance & Goods Box */}
                <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Balance Due:
                    </span>
                    <span
                      className={`text-xl font-black ${
                        isSettled
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isSettled ? '₹0 (Settled)' : `₹${cust.amountDue.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.credit.lastPaid}:
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {cust.lastPaymentDate || 'Never'}
                    </span>
                  </div>
                </div>

                {/* Items taken */}
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-4 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                  <strong className="text-slate-700 dark:text-slate-300">Items: </strong>
                  {cust.itemsTaken}
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        setCreditActionModal({
                          open: true,
                          customer: cust,
                          mode: 'addCredit',
                          amount: '',
                          noteOrItems: '',
                        })
                      }
                      className="py-2 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition cursor-pointer"
                    >
                      {t.credit.addMoreCredit}
                    </button>

                    <button
                      onClick={() =>
                        setCreditActionModal({
                          open: true,
                          customer: cust,
                          mode: 'recordPayment',
                          amount: '',
                          noteOrItems: '',
                        })
                      }
                      className="py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs text-center border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                    >
                      {t.credit.recordPayment}
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Mark full payment of ₹${cust.amountDue} received from ${cust.name}?`
                          )
                        ) {
                          markCustomerFullyPaid(cust.id);
                        }
                      }}
                      disabled={isSettled}
                      className="py-2 px-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 disabled:opacity-40 text-amber-800 dark:text-amber-300 font-bold text-xs text-center border border-amber-200 dark:border-amber-800/60 transition cursor-pointer"
                    >
                      {t.credit.markPaid}
                    </button>
                  </div>

                  {/* Send WhatsApp & SMS Reminder Buttons */}
                  {!isSettled && (
                    <div className="flex gap-2 pt-1">
                      <a
                        href={getWhatsAppReminderUrl(cust)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/30 transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>{t.credit.sendWhatsApp}</span>
                      </a>

                      <a
                        href={getSmsReminderUrl(cust)}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </a>

                      <button
                        onClick={() => setHistoryModal(cust)}
                        title="Payment History"
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                      >
                        <History className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Customer Modal */}
      {addCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.credit.addNewCustomer}
              </h3>
              <button
                onClick={() => setAddCustomerModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Customer Name:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Ramesh Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Mobile Number (for WhatsApp reminder):
                </label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 9822012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Amount Given (₹):
                  </label>
                  <input
                    type="number"
                    required
                    value={newCustAmount}
                    onChange={(e) => setNewCustAmount(e.target.value)}
                    placeholder="e.g. 850"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Promise Date:
                  </label>
                  <input
                    type="date"
                    value={newCustDueDate}
                    onChange={(e) => setNewCustDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Items Taken:
                </label>
                <input
                  type="text"
                  value={newCustItems}
                  onChange={(e) => setNewCustItems(e.target.value)}
                  placeholder="e.g. Rice 5kg, Oil 1L, Sugar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Trust Badge:
                </label>
                <select
                  value={newCustTrust}
                  onChange={(e) => setNewCustTrust(e.target.value as TrustLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="Pays on time">Pays on time ⭐</option>
                  <option value="Sometimes late">Sometimes late ⚠️</option>
                  <option value="Often late">Often late 🚨</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddCustomerModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit / Payment Action Modal */}
      {creditActionModal.open && creditActionModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
              {creditActionModal.mode === 'addCredit'
                ? `+ Add More Udhaar: ${creditActionModal.customer.name}`
                : `Record Payment: ${creditActionModal.customer.name}`}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current Due: ₹{creditActionModal.customer.amountDue}
            </p>

            <form onSubmit={handleCreditActionSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Amount (₹):</label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={creditActionModal.amount}
                  onChange={(e) =>
                    setCreditActionModal({ ...creditActionModal, amount: e.target.value })
                  }
                  placeholder="e.g. 500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-bold focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {creditActionModal.mode === 'addCredit' ? 'Items added:' : 'Note (optional):'}
                </label>
                <input
                  type="text"
                  value={creditActionModal.noteOrItems}
                  onChange={(e) =>
                    setCreditActionModal({ ...creditActionModal, noteOrItems: e.target.value })
                  }
                  placeholder={
                    creditActionModal.mode === 'addCredit'
                      ? 'e.g. 2kg Sugar, 1 packet tea'
                      : 'e.g. Cash paid at counter or GPay'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setCreditActionModal({ ...creditActionModal, open: false, customer: null })
                  }
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Payment History: {historyModal.name}
              </h3>
              <button
                onClick={() => setHistoryModal(null)}
                className="p-1 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4 max-h-60 overflow-y-auto space-y-2">
              {(!historyModal.history || historyModal.history.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No payment history recorded yet.
                </p>
              ) : (
                historyModal.history.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">
                        ₹{h.amount}
                      </span>
                      <span className="text-[10px] text-slate-400">{h.note || 'Settlement'}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{h.date}</span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setHistoryModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Remind All Pending Modal */}
      {remindAllConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-indigo-600">
              <Bell className="w-5 h-5" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {t.credit.remindAll}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.credit.remindAllDesc}. Click any pending customer below to instantly launch their polite WhatsApp reminder with your shop name & UPI ID:
            </p>

            <div className="my-4 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {customers
                .filter((c) => c.amountDue > 0)
                .map((c) => (
                  <div
                    key={c.id}
                    className="py-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-rose-600 font-bold">
                        ₹{c.amountDue} due
                      </span>
                    </div>
                    <a
                      href={getWhatsAppReminderUrl(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </a>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setRemindAllConfirmOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
