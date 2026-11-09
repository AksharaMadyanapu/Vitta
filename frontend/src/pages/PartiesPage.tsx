import React, { useState } from 'react';
import { CustomersPage } from './CustomersPage';
import { SuppliersPage } from './SuppliersPage';

export const PartiesPage: React.FC = () => {
  const [tab, setTab] = useState<'customers' | 'suppliers'>('customers');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2 text-sm font-medium">
        <button
          onClick={() => setTab('customers')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            tab === 'customers' ? 'bg-[#EEF2FF] text-[#2548C9]' : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => setTab('suppliers')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            tab === 'suppliers' ? 'bg-[#EEF2FF] text-[#2548C9]' : 'text-[#6B7280] hover:text-[#111827]'
          }`}
        >
          Suppliers
        </button>
      </div>

      {tab === 'customers' ? <CustomersPage /> : <SuppliersPage />}
    </div>
  );
};
