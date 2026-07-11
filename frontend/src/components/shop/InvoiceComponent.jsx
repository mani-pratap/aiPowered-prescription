import { forwardRef } from 'react';
import { Package, MapPin, CreditCard, Stethoscope } from 'lucide-react';

const InvoiceComponent = forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div ref={ref} className="bg-white text-slate-900 p-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
        <div>
          <div className="flex items-center text-indigo-600 mb-2">
            <Stethoscope className="w-8 h-8 mr-2" />
            <h1 className="text-2xl font-black tracking-tight">SmartPrescription</h1>
          </div>
          <p className="text-sm text-slate-500">123 Health Avenue, Medical District</p>
          <p className="text-sm text-slate-500">contact@smartprescription.com | +91 9876543210</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-widest mb-2">Invoice</h2>
          <p className="text-sm font-semibold text-slate-600">Order: #{order.orderNumber}</p>
          <p className="text-sm text-slate-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
            PAID
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" /> Billed & Shipped To
          </h3>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="font-bold text-slate-800">{order.deliveryAddress.fullName}</p>
            <p className="text-sm text-slate-600 mt-1">{order.deliveryAddress.addressLine1}</p>
            {order.deliveryAddress.addressLine2 && <p className="text-sm text-slate-600">{order.deliveryAddress.addressLine2}</p>}
            <p className="text-sm text-slate-600">{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.postalCode}</p>
            <p className="text-sm text-slate-600 mt-2 font-medium">Ph: {order.deliveryAddress.phone}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-1" /> Payment Info
          </h3>
          <div className="bg-slate-50 p-4 rounded-lg h-full">
            <p className="text-sm text-slate-600">Payment Method: Online (Dummy)</p>
            <p className="text-sm text-slate-600 mt-1">Transaction ID: TXN-{Math.floor(Math.random() * 1000000000)}</p>
            <p className="text-sm font-bold text-indigo-600 mt-4">Status: Success</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="py-3 px-2 text-sm font-bold text-slate-800">Item Description</th>
              <th className="py-3 px-2 text-sm font-bold text-slate-800 text-center w-24">Qty</th>
              <th className="py-3 px-2 text-sm font-bold text-slate-800 text-right w-32">Unit Price</th>
              <th className="py-3 px-2 text-sm font-bold text-slate-800 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="py-3 px-2 text-sm text-slate-700 font-medium">{item.name}</td>
                <td className="py-3 px-2 text-sm text-slate-700 text-center">{item.quantity}</td>
                <td className="py-3 px-2 text-sm text-slate-700 text-right">₹{item.price.toFixed(2)}</td>
                <td className="py-3 px-2 text-sm text-slate-800 font-bold text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Discount (Savings)</span>
            <span>-₹{order.discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Shipping</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-800 pt-3">
            <span>Total</span>
            <span>₹{order.finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t border-slate-200 pt-8 mt-12">
        <Package className="w-6 h-6 mx-auto text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm font-medium">Thank you for your purchase!</p>
        <p className="text-slate-400 text-xs mt-1">This is a computer generated invoice.</p>
      </div>
    </div>
  );
});

export default InvoiceComponent;
