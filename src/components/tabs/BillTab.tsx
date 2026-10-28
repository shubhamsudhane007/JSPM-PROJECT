import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  ReceiptText,
  Plus,
  Trash2,
  Printer,
  Share2,
  QrCode,
  CheckCircle2,
  Store,
  DollarSign,
  X,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Bill, BillItem } from '../../types';

export const BillTab: React.FC = () => {
  const { stock, settings, bills, addBill, language, t } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'credit'>('upi');
  const [billItems, setBillItems] = useState<BillItem[]>([
    {
      name: 'Aashirvaad Shuddh Chakki Atta (10kg)',
      quantity: 1,
      unit: 'packet',
      rate: 460,
      amount: 460,
    },
    {
      name: 'Daawat Rozana Basmati Rice',
      quantity: 2,
      unit: 'kg',
      rate: 95,
      amount: 190,
    },
  ]);

  const [activeReceipt, setActiveReceipt] = useState<Bill | null>(() => bills[0] || null);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Generate UPI QR code for the active receipt
  useEffect(() => {
    if (!activeReceipt) return;

    const upiId = settings.upiId || 'shubham@okaxis';
    const shopName = encodeURIComponent(settings.shopName);
    const amount = activeReceipt.totalAmount;
    // Standard National Payments Corporation of India UPI Deep Link
    const upiString = `upi://pay?pa=${upiId}&pn=${shopName}&am=${amount}&cu=INR&tn=Bill-${activeReceipt.billNumber}`;

    QRCode.toDataURL(upiString, { width: 220, margin: 1 })
      .then((url) => setUpiQrDataUrl(url))
      .catch((err) => console.warn('QR Code generation failed:', err));
  }, [activeReceipt, settings.upiId, settings.shopName]);

  const addItemFromStock = (stockId: string) => {
    const item = stock.find((s) => s.id === stockId);
    if (!item) return;

    const existingIndex = billItems.findIndex((b) => b.name === item.name);
    if (existingIndex >= 0) {
      const updated = [...billItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].amount = updated[existingIndex].quantity * updated[existingIndex].rate;
      setBillItems(updated);
    } else {
      setBillItems([
        ...billItems,
        {
          itemId: item.id,
          name: item.name,
          quantity: 1,
          unit: item.unit,
          rate: item.sellingPrice,
          amount: item.sellingPrice,
        },
      ]);
    }
  };

  const addCustomItemRow = () => {
    setBillItems([
      ...billItems,
      {
        name: 'Custom Provision',
        quantity: 1,
        unit: 'packet',
        rate: 50,
        amount: 50,
      },
    ]);
  };

  const updateItemRow = (index: number, field: keyof BillItem, value: any) => {
    const updated = [...billItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      item.amount = (parseFloat(item.quantity as any) || 0) * (parseFloat(item.rate as any) || 0);
    }
    updated[index] = item;
    setBillItems(updated);
  };

  const removeItemRow = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const totalBillAmount = billItems.reduce((sum, item) => sum + item.amount, 0);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (billItems.length === 0 || totalBillAmount <= 0) return;

    const billNumber = `DS-${Date.now().toString().slice(-4)}`;
    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      billNumber,
      customerName: customerName.trim() || 'Valued Customer',
      customerPhone: customerPhone.trim(),
      items: billItems,
      totalAmount: totalBillAmount,
      date: new Date().toISOString().split('T')[0],
      paymentMode,
    };

    addBill(newBill);
    setActiveReceipt(newBill);
    setShowReceiptModal(true);

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {}

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
  };

  const shareReceiptOnWhatsApp = (bill: Bill) => {
    let msg = `🧾 *${settings.shopName}* - Digital Bill\nBill No: *${bill.billNumber}*\nDate: ${bill.date}\nCustomer: ${bill.customerName}\n\n`;
    msg += `*Items:*\n`;
    bill.items.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} (${item.quantity} ${item.unit}) - ₹${item.amount}\n`;
    });
    msg += `\n*Grand Total: ₹${bill.totalAmount}*\nPayment Mode: ${bill.paymentMode.toUpperCase()}\n`;

    if (settings.upiId) {
      msg += `\nPay via UPI: *${settings.upiId}*\n`;
    }
    msg += `\nThank you for shopping with us! Visit again. 🙏`;

    const phone = bill.customerPhone ? bill.customerPhone.replace(/\D/g, '') : '';
    const phoneWithCountry = phone.length >= 10 && !phone.startsWith('91') ? `91${phone}` : phone;

    const url = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.bills.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.bills.subtitle}
          </p>
        </div>

        {activeReceipt && (
          <button
            onClick={() => setShowReceiptModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold shadow-sm shadow-orange-500/30 transition cursor-pointer"
          >
            <ReceiptText className="w-4 h-4" />
            <span>View Last Bill ({activeReceipt.billNumber})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Bill Generator Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.bills.newBill}</span>
          </h3>

          <form onSubmit={handleCreateBill} className="space-y-4">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {t.bills.customerName}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Bhai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  {t.bills.customerPhone}
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9822012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Quick Add From Stock */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                Quick Add Items from Stock:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {stock.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItemFromStock(item.id)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    + {item.name} (₹{item.sellingPrice})
                  </button>
                ))}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 w-16 text-center">Qty</th>
                    <th className="p-2.5 w-20 text-right">Rate</th>
                    <th className="p-2.5 w-24 text-right">Amount</th>
                    <th className="p-2.5 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {billItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItemRow(idx, 'name', e.target.value)}
                          className="w-full bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemRow(idx, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-14 text-center rounded-lg bg-slate-100 dark:bg-slate-800 px-1 py-1 font-bold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItemRow(idx, 'rate', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 text-right rounded-lg bg-slate-100 dark:bg-slate-800 px-1 py-1 font-bold text-slate-900 dark:text-white"
                        />
                      </td>
                      <td className="p-2.5 text-right font-black text-slate-900 dark:text-white">
                        ₹{item.amount}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={addCustomItemRow}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  + Add Custom Row
                </button>
                <div className="text-right">
                  <span className="text-xs text-slate-500 mr-2 font-bold">{t.bills.grandTotal}:</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹{totalBillAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">
                {t.bills.paymentMode}:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'upi', label: 'UPI / QR', icon: QrCode },
                    { id: 'cash', label: 'Cash', icon: DollarSign },
                    { id: 'credit', label: 'Udhaar', icon: CreditCard },
                  ] as const
                ).map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMode(pm.id)}
                      className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border transition cursor-pointer ${
                        paymentMode === pm.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={billItems.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-lg shadow-emerald-600/25 transition active:scale-98 cursor-pointer disabled:opacity-40"
            >
              {t.bills.generateBill} (₹{totalBillAmount})
            </button>
          </form>
        </div>

        {/* Right Column: Recent Bills & Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.bills.recentBills}
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  onClick={() => {
                    setActiveReceipt(bill);
                    setShowReceiptModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {bill.billNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {bill.paymentMode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {bill.customerName} • {bill.date}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                      ₹{bill.totalAmount}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {bill.items.length} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Digital Receipt Modal with Live UPI QR */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Digital Receipt Preview
              </span>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Style Receipt Card */}
            <div className="p-4 my-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 font-sans space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                <h4 className="font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">
                  {settings.shopName}
                </h4>
                <p className="text-[11px] text-slate-500">{settings.address}</p>
                <p className="text-[11px] text-slate-500">Phone: {settings.phone}</p>
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Bill: {activeReceipt.billNumber}</span>
                  <span>{activeReceipt.date}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 text-xs py-1 border-b border-dashed border-slate-300 dark:border-slate-700">
                {activeReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="pr-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.quantity} {item.unit} x ₹{item.rate}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      ₹{item.amount}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-sm font-black text-slate-900 dark:text-white pt-1">
                <span>Grand Total:</span>
                <span className="text-lg text-emerald-600 dark:text-emerald-400">
                  ₹{activeReceipt.totalAmount}
                </span>
              </div>

              {/* Dynamic UPI QR Code for instant scan and pay */}
              {activeReceipt.paymentMode === 'upi' && upiQrDataUrl && (
                <div className="text-center pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                  <div className="bg-white p-2.5 rounded-xl inline-block shadow-xs border border-slate-200">
                    <img src={upiQrDataUrl} alt="UPI QR Code" className="w-36 h-36 mx-auto" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mt-1">
                    Scan via PhonePe, GPay, Paytm
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    UPI: {settings.upiId}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => shareReceiptOnWhatsApp(activeReceipt)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t.bills.shareBillWa}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t.bills.printReceipt}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
