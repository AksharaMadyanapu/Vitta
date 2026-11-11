import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Upload,
  FileText,
  Building,
  Building2,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

export const MoneyPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get('tab') as 'invoices' | 'customers' | 'suppliers' | 'bank') || 'invoices';
  const setTab = (tab: 'invoices' | 'customers' | 'suppliers' | 'bank') => {
    setSearchParams({ tab });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { success } = useToast();

  // Tab 1: Invoices Data
  const invoices = [
    {
      id: 'inv-1',
      number: 'INV-2026-0491',
      party: 'Kalyani Powertrain Ltd',
      type: 'Receivable',
      amount: 640000,
      dueDate: '16 Nov 2026',
      status: 'Waiting',
      statusVariant: 'caution' as const,
      avatarBg: 'bg-[#CDEBDD]',
      avatarText: 'text-[#0F3D33]',
      details: 'Supply of CNC machined engine brackets. 30 days credit terms. Contact: Suresh Kumar.',
    },
    {
      id: 'inv-2',
      number: 'INV-2026-0478',
      party: 'Varroc Engineering Components',
      type: 'Receivable',
      amount: 1120000,
      dueDate: '4 Nov 2026',
      status: 'Overdue by 12d',
      statusVariant: 'danger' as const,
      avatarBg: 'bg-[#FFE8A3]',
      avatarText: 'text-[#8A5B00]',
      details: 'Shaft pin assemblies. Customer historically delays by ~24 days. Reminder sent on 8 Nov.',
    },
    {
      id: 'inv-3',
      number: 'PO-TS-8812',
      party: 'Tata Steel BSL Ltd',
      type: 'Payable',
      amount: 750000,
      dueDate: '28 Nov 2026',
      status: 'Due in 18d',
      statusVariant: 'caution' as const,
      avatarBg: 'bg-[#F1E9DC]',
      avatarText: 'text-[#0F3D33]',
      details: 'Hot rolled steel coil procurement for stamping plant. Payable to State Bank vendor account.',
    },
    {
      id: 'inv-4',
      number: 'INV-2026-0430',
      party: 'Sundaram Fasteners Ltd',
      type: 'Receivable',
      amount: 750000,
      dueDate: '28 Oct 2026',
      status: 'Paid',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#CDEBDD]',
      avatarText: 'text-[#0F3D33]',
      details: 'High tensile fasteners. Received via RTGS into HDFC Bank account on 30 Oct 2026.',
    },
    {
      id: 'inv-5',
      number: 'PO-HE-9102',
      party: 'Hindalco Extrusions',
      type: 'Payable',
      amount: 220000,
      dueDate: '25 Nov 2026',
      status: 'Waiting',
      statusVariant: 'caution' as const,
      avatarBg: 'bg-[#FFE8A3]',
      avatarText: 'text-[#8A5B00]',
      details: 'Aluminum alloy bars. 30 days payment terms agreed. Delivery confirmed at warehouse.',
    },
  ];

  // Tab 2: Customers Data
  const customers = [
    {
      id: 'c-1',
      name: 'Sundaram Fasteners Ltd',
      contact: 'Anand Natarajan',
      phone: '+91 98401 22345',
      email: 'a.natarajan@sundaram.in',
      amount: 840000,
      terms: '45 days terms',
      status: 'Reliable (2d delay)',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#CDEBDD]',
      avatarText: 'text-[#0F3D33]',
      details: 'Tier-1 automotive OEM. Excellent payment track record over 18 paid invoices.',
    },
    {
      id: 'c-2',
      name: 'Sai Auto Parts & Gearbox',
      contact: 'Ramesh Gupta',
      phone: '+91 98220 54321',
      email: 'rgupta@saiauto.com',
      amount: 900000,
      terms: '30 days terms',
      status: 'Chronically late (32d)',
      statusVariant: 'danger' as const,
      avatarBg: 'bg-[#FDEEE9]',
      avatarText: 'text-[#FF6B4A]',
      details: 'Largest open receivable. High risk of triggering working capital crunch this month.',
    },
    {
      id: 'c-3',
      name: 'Kalyani Powertrain Ltd',
      contact: 'Suresh Kumar',
      phone: '+91 98220 11984',
      email: 'suresh.k@kalyanipower.com',
      amount: 640000,
      terms: '30 days terms',
      status: 'Moderate (14d delay)',
      statusVariant: 'caution' as const,
      avatarBg: 'bg-[#FFE8A3]',
      avatarText: 'text-[#8A5B00]',
      details: 'Mid-sized engine supplier. Generally settles within 2 weeks of invoice maturity.',
    },
    {
      id: 'c-4',
      name: 'Varroc Engineering Components',
      contact: 'Mahesh Patil',
      phone: '+91 94222 88412',
      email: 'mpatil@varroc.com',
      amount: 1120000,
      terms: '60 days terms',
      status: 'Chronically late (24d)',
      statusVariant: 'danger' as const,
      avatarBg: 'bg-[#FDEEE9]',
      avatarText: 'text-[#FF6B4A]',
      details: 'Overdue bill pending. Consider offering 2% early cash discount to expedite collection.',
    },
    {
      id: 'c-5',
      name: 'Motherson Automotive Parts',
      contact: 'Praveen Shah',
      phone: '+91 99100 88231',
      email: 'pshah@motherson.com',
      amount: 590000,
      terms: '45 days terms',
      status: 'Reliable (3d delay)',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#CDEBDD]',
      avatarText: 'text-[#0F3D33]',
      details: 'Very regular customer with 22 successfully closed billing cycles.',
    },
  ];

  // Tab 3: Suppliers Data
  const suppliers = [
    {
      id: 's-1',
      name: 'Tata Steel BSL Ltd',
      contact: 'Vikram Joshi',
      phone: '+91 98300 11442',
      email: 'vjoshi@tatasteel.com',
      amount: 750000,
      terms: '30 days terms',
      status: 'Due soon',
      statusVariant: 'caution' as const,
      avatarBg: 'bg-[#FFE8A3]',
      avatarText: 'text-[#8A5B00]',
      details: 'Critical raw material provider. Late payment may freeze future raw steel coil deliveries.',
    },
    {
      id: 's-2',
      name: 'Hindalco Extrusions',
      contact: 'Sanjay Deshmukh',
      phone: '+91 98210 99432',
      email: 'sanjay.d@adityabirla.com',
      amount: 220000,
      terms: '30 days terms',
      status: 'Normal',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#CDEBDD]',
      avatarText: 'text-[#0F3D33]',
      details: 'Aluminum bar suppliers. Reliable partner with flexible delivery schedules.',
    },
    {
      id: 's-3',
      name: 'Sandvik Coromant India',
      contact: 'Karan Mehra',
      phone: '+91 98800 66124',
      email: 'karan.mehra@sandvik.com',
      amount: 340000,
      terms: '15 days terms',
      status: 'Due soon',
      statusVariant: 'caution' as const,
      avatarBg: 'bg-[#F1E9DC]',
      avatarText: 'text-[#0F3D33]',
      details: 'CNC cutting tools and carbide inserts. Pre-transaction assessment recommended for next PO.',
    },
    {
      id: 's-4',
      name: 'BPCL Industrial Lubricants',
      contact: 'Nilesh Rao',
      phone: '+91 94480 33190',
      email: 'nilesh.rao@bpcl.in',
      amount: 115000,
      terms: '30 days terms',
      status: 'Normal',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#CDEBDD]',
      avatarText: 'text-[#0F3D33]',
      details: 'Coolant oils and industrial machine lubricants delivered on monthly contract.',
    },
  ];

  // Tab 4: Bank Data
  const bankAccounts = [
    {
      id: 'b-1',
      name: 'HDFC Bank — Current Account',
      number: '•••• 9481',
      branch: 'Balanagar Industrial Estate',
      amount: 1245200,
      terms: 'Primary operational',
      status: 'Active',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#CDEBDD]',
      avatarText: 'text-[#0F3D33]',
      details: 'Primary operating account used for customer receipts and vendor payments.',
    },
    {
      id: 'b-2',
      name: 'State Bank of India — Cash Credit / OD',
      number: '•••• 1102',
      branch: 'Sanath Nagar SME Branch',
      amount: 450000,
      terms: 'Limit ₹25,00,000',
      status: 'Drawing power safe',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#FFE8A3]',
      avatarText: 'text-[#8A5B00]',
      details: 'Working capital credit line. Assumed borrowing interest rate is 12% per annum.',
    },
    {
      id: 'b-3',
      name: 'ICICI Bank — Tax & Statutory',
      number: '•••• 6301',
      branch: 'Begumpet Branch',
      amount: 150000,
      terms: 'Reserve account',
      status: 'Active',
      statusVariant: 'safe' as const,
      avatarBg: 'bg-[#F1E9DC]',
      avatarText: 'text-[#0F3D33]',
      details: 'Dedicated balance kept for monthly GST filings and employee provident fund payments.',
    },
  ];

  // Open item drawer
  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  // Filter items based on search
  const filteredInvoices = invoices.filter((i) =>
    i.party.toLowerCase().includes(searchTerm.toLowerCase()) || i.number.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredBank = bankAccounts.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.number.includes(searchTerm)
  );

  return (
    <div className="space-y-12">
      {/* Title */}
      <PageHeader
        title="Who owes me, and who do I owe?"
        description="All your bills, customers, suppliers, and bank accounts in one calm view."
      />

      {/* Tabs as soft pill chips */}
      <div className="flex items-center gap-2">
        {[
          { key: 'invoices', label: 'Invoices' },
          { key: 'customers', label: 'Customers' },
          { key: 'suppliers', label: 'Suppliers' },
          { key: 'bank', label: 'Bank' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setTab(tab.key as any);
              setSearchTerm('');
            }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-250 ${
              currentTab === tab.key
                ? 'bg-[#0F3D33] text-[#FBF7F0] shadow-soft'
                : 'bg-[#F1E9DC] text-[#527A71] hover:text-[#0F3D33]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Single Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#527A71]" />
          <input
            type="text"
            placeholder={`Search ${currentTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-full text-sm text-[#0F3D33] placeholder-[#8FB4AC] focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20 shadow-soft"
          />
        </div>

        <div>
          {currentTab === 'invoices' && (
            <Button variant="primary" size="md" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add invoice
            </Button>
          )}
          {currentTab === 'customers' && (
            <Button variant="primary" size="md" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add customer
            </Button>
          )}
          {currentTab === 'suppliers' && (
            <Button variant="primary" size="md" onClick={() => setModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Add supplier
            </Button>
          )}
          {currentTab === 'bank' && (
            <Button variant="primary" size="md" onClick={() => setModalOpen(true)} leftIcon={<Upload className="w-4 h-4" />}>
              Upload statement
            </Button>
          )}
        </div>
      </div>

      {/* Rule 9: Lists with Avatar circles in palette colours, generous row height, status chips, Fraunces amounts */}
      <div className="bg-white rounded-[24px] shadow-soft divide-y divide-[#F1E9DC] overflow-hidden">
        {currentTab === 'invoices' &&
          filteredInvoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() => handleItemClick(inv)}
              className="p-5 sm:px-7 flex items-center justify-between gap-4 hover:bg-[#F1E9DC]/30 cursor-pointer transition-colors duration-250"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-11 h-11 rounded-full ${inv.avatarBg} ${inv.avatarText} flex items-center justify-center font-serif font-bold text-sm shrink-0`}>
                  {inv.party.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F3D33] truncate">{inv.party}</p>
                    <span className="text-xs text-[#527A71]">· {inv.number}</span>
                  </div>
                  <p className="text-xs text-[#527A71] mt-0.5">{inv.type} · Due {inv.dueDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0 text-right">
                <div>
                  <p className="text-base font-semibold font-serif text-[#0F3D33] tabular-nums">{formatINR(inv.amount)}</p>
                  <p className="text-[11px] text-[#527A71]">{inv.dueDate}</p>
                </div>
                <Badge variant={inv.statusVariant}>{inv.status}</Badge>
                <ChevronRight className="w-4 h-4 text-[#8FB4AC]" />
              </div>
            </div>
          ))}

        {currentTab === 'customers' &&
          filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => handleItemClick(cust)}
              className="p-5 sm:px-7 flex items-center justify-between gap-4 hover:bg-[#F1E9DC]/30 cursor-pointer transition-colors duration-250"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-11 h-11 rounded-full ${cust.avatarBg} ${cust.avatarText} flex items-center justify-center font-serif font-bold text-sm shrink-0`}>
                  {cust.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F3D33] truncate">{cust.name}</p>
                  <p className="text-xs text-[#527A71] mt-0.5">{cust.contact} · {cust.terms}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0 text-right">
                <div>
                  <p className="text-base font-semibold font-serif text-[#0F3D33] tabular-nums">{formatINR(cust.amount)}</p>
                  <p className="text-[11px] text-[#527A71]">Open balance</p>
                </div>
                <Badge variant={cust.statusVariant}>{cust.status}</Badge>
                <ChevronRight className="w-4 h-4 text-[#8FB4AC]" />
              </div>
            </div>
          ))}

        {currentTab === 'suppliers' &&
          filteredSuppliers.map((supp) => (
            <div
              key={supp.id}
              onClick={() => handleItemClick(supp)}
              className="p-5 sm:px-7 flex items-center justify-between gap-4 hover:bg-[#F1E9DC]/30 cursor-pointer transition-colors duration-250"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-11 h-11 rounded-full ${supp.avatarBg} ${supp.avatarText} flex items-center justify-center font-serif font-bold text-sm shrink-0`}>
                  {supp.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F3D33] truncate">{supp.name}</p>
                  <p className="text-xs text-[#527A71] mt-0.5">{supp.contact} · {supp.terms}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0 text-right">
                <div>
                  <p className="text-base font-semibold font-serif text-[#0F3D33] tabular-nums">{formatINR(supp.amount)}</p>
                  <p className="text-[11px] text-[#527A71]">To pay</p>
                </div>
                <Badge variant={supp.statusVariant}>{supp.status}</Badge>
                <ChevronRight className="w-4 h-4 text-[#8FB4AC]" />
              </div>
            </div>
          ))}

        {currentTab === 'bank' &&
          filteredBank.map((bank) => (
            <div
              key={bank.id}
              onClick={() => handleItemClick(bank)}
              className="p-5 sm:px-7 flex items-center justify-between gap-4 hover:bg-[#F1E9DC]/30 cursor-pointer transition-colors duration-250"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-11 h-11 rounded-full ${bank.avatarBg} ${bank.avatarText} flex items-center justify-center font-serif font-bold text-sm shrink-0`}>
                  {bank.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0F3D33] truncate">{bank.name}</p>
                  <p className="text-xs text-[#527A71] mt-0.5">{bank.branch} · {bank.terms}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 shrink-0 text-right">
                <div>
                  <p className="text-base font-semibold font-serif text-[#0F3D33] tabular-nums">{formatINR(bank.amount)}</p>
                  <p className="text-[11px] text-[#527A71]">Available</p>
                </div>
                <Badge variant={bank.statusVariant}>{bank.status}</Badge>
                <ChevronRight className="w-4 h-4 text-[#8FB4AC]" />
              </div>
            </div>
          ))}
      </div>

      {/* Progressive Disclosure Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedItem?.party || selectedItem?.name || 'Details'}
        description={selectedItem?.number || selectedItem?.terms || 'Full record details'}
      >
        {selectedItem && (
          <div className="space-y-6 pt-2">
            <div className="p-6 rounded-[20px] bg-[#F1E9DC] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#527A71] font-semibold uppercase tracking-wider">Amount</span>
                <p className="text-2xl font-bold font-serif text-[#0F3D33] tabular-nums mt-0.5">
                  {formatINR(selectedItem.amount)}
                </p>
              </div>
              <Badge variant={selectedItem.statusVariant}>{selectedItem.status}</Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#527A71] uppercase tracking-wider">
                Overview & Context
              </h4>
              <p className="text-sm text-[#28584E] leading-relaxed bg-[#FBF7F0] p-4 rounded-2xl">
                {selectedItem.details}
              </p>
            </div>

            {selectedItem.phone && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#527A71] uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="flex items-center gap-2 text-sm text-[#0F3D33]">
                  <Phone className="w-4 h-4 text-[#8FB4AC]" />
                  <span>{selectedItem.phone}</span>
                </div>
                {selectedItem.email && (
                  <div className="flex items-center gap-2 text-sm text-[#0F3D33]">
                    <Mail className="w-4 h-4 text-[#8FB4AC]" />
                    <span>{selectedItem.email}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => {
                  setDrawerOpen(false);
                  success('Action taken', 'Item updated in the system.');
                }}
              >
                Mark as reviewed
              </Button>
              <Button variant="secondary" size="md" onClick={() => setDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Creation Modal for Add Actions */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Add new ${currentTab.slice(0, -1)}`}
        description="Add a new record to your cash intelligence ledger."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                success('Success', `New ${currentTab.slice(0, -1)} added.`);
              }}
            >
              Save record
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#527A71] uppercase tracking-wider mb-1.5">
              Name / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Anand Automotives Pvt Ltd"
              className="w-full px-4 py-2.5 bg-[#FBF7F0] rounded-xl text-sm text-[#0F3D33] focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#527A71] uppercase tracking-wider mb-1.5">
              Amount (₹)
            </label>
            <input
              type="number"
              placeholder="500000"
              className="w-full px-4 py-2.5 bg-[#FBF7F0] rounded-xl text-sm font-semibold font-serif text-[#0F3D33] focus:outline-none focus:ring-2 focus:ring-[#0F3D33]/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
