import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import orderService from '../services/orderService';
import InvoiceComponent from '../components/shop/InvoiceComponent';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (error) {
        toast.error('Failed to load order details');
      }
    };
    fetchOrder();
  }, [id]);

  const downloadInvoice = () => {
    if (!invoiceRef.current) return;
    const element = invoiceRef.current;
    
    // Make visible just for download
    element.style.display = 'block';
    
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `Invoice_${order.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .save()
      .then(() => {
        // Hide again
        element.style.display = 'none';
      });
  };

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10 rounded-full mb-6">
        <CheckCircle className="w-12 h-12 text-emerald-500" />
      </div>
      <h1 className="text-4xl font-black text-white mb-4">Order Successful!</h1>
      <p className="text-lg text-slate-400 mb-2">Thank you for your purchase.</p>
      <p className="text-slate-300 font-mono bg-slate-900 px-4 py-2 rounded-lg inline-block border border-slate-800 mb-10">
        Order ID: {order.orderNumber}
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={downloadInvoice}
          className="flex items-center justify-center px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Invoice
        </button>
        <Link 
          to="/orders"
          className="flex items-center justify-center px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          View All Orders
        </Link>
      </div>

      {/* Hidden Invoice Component for PDF generation */}
      <div style={{ display: 'none' }}>
        <InvoiceComponent ref={invoiceRef} order={order} />
      </div>
    </div>
  );
};

export default OrderSuccess;
