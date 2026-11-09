import React, { useState } from 'react';
import { Plus, Upload, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  party: string;
  type: 'receivable' | 'payable';
  amount: number;
  dueDate: string;
  status: 'paid' | 'waiting' | 'overdue';
}

export const InvoicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'receivable' | 'payable'>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { success } = useToast();

  const mockInvoices: InvoiceItem[] = [
    {
      id: 'inv-1',
      invoiceNo: 'INV-2026-0491',
      party: 'Kalyani Powertrain Ltd',
      type: 'receivable',
      amount: 640000,
      dueDate: '16 Nov 2026',
      status: 'waiting',
    },
    {
      id: 'inv-2',
      invoiceNo: 'INV-2026-0478',
      party: 'Varroc Engineering Components',
      type: 'receivable',
      amount: 1120000,
      dueDate: '4 Nov 2026',
      status: 'overdue',
    },
    {
      id: 'inv-3',
      invoiceNo: 'PO-TS-8812',
      party: 'Tata Steel BSL Ltd',
      type: 'payable',
      amount: 480000,
      dueDate: '20 Nov 2026',
      status: 'waiting',
    },
    {
      id: 'inv-4',
      invoiceNo: 'INV-2026-0430',
      party: 'Sundaram Fasteners Ltd',
      type: 'receivable',
      amount: 750000,
      dueDate: '28 Oct 2026',
      status: 'paid',
    },
    {
      id: 'inv-5',
      invoiceNo: 'PO-HE-9102',
      party: 'Hindalco Extrusions',
      type: 'payable',
      amount: 220000,
      dueDate: '25 Nov 2026',
      status: 'waiting',
    },
  ];

  const filtered = mockInvoices.filter((inv) => {
    if (activeTab === 'receivable') return inv.type === 'receivable';
    if (activeTab === 'payable') return inv.type === 'payable';
    return true;
  });

  const columns: Column<InvoiceItem>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice number',
      sortable: true,
      render: (inv) => (
        <span className="font-medium text-[#111827]">{inv.invoiceNo}</span>
      ),
    },
    {
      key: 'party',
      header: 'Customer or supplier',
      sortable: true,
      render: (inv) => (
        <div>
          <span className="text-[#111827] font-medium">{inv.party}</span>
          <p className="text-xs text-[#6B7280]">
            {inv.type === 'receivable' ? 'Money coming in' : 'Money going out'}
          </p>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due date',
      sortable: true,
      className: 'text-xs text-[#6B7280]',
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (inv) => (
        <span className="font-medium text-[#111827] tabular-nums">
          {formatINR(inv.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      sortable: true,
      render: (inv) => {
        if (inv.status === 'paid') {
          return <Badge variant="safe">Paid</Badge>;
        }
        if (inv.status === 'overdue') {
          return <Badge variant="danger">Overdue</Badge>;
        }
        return <Badge variant="caution">Waiting for payment</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Track money coming in from customers and bills you need to pay to suppliers."
        action={
          <Button
            variant="primary"
            onClick={() => success('New invoice', 'Opening invoice editor...')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create invoice
          </Button>
        }
        secondaryAction={
          <Button
            variant="secondary"
            onClick={() => setUploadModalOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload invoice PDF
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Money waiting to come in"
          value={1760000}
          subtitle="2 customer invoices"
        />
        <StatCard
          title="Overdue from customers"
          value={1120000}
          subtitle="1 invoice overdue"
          statusVariant="danger"
        />
        <StatCard
          title="Bills you need to pay"
          value={700000}
          subtitle="2 supplier bills"
        />
      </div>

      {/* Filter Tabs & Table Card */}
      <Card>
        <div className="flex items-center gap-1 border-b border-[#E5E7EB] pb-3 mb-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-[#EEF2FF] text-[#2548C9]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            All invoices ({mockInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab('receivable')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'receivable'
                ? 'bg-[#EEF2FF] text-[#2548C9]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Money coming in (3)
          </button>
          <button
            onClick={() => setActiveTab('payable')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'payable'
                ? 'bg-[#EEF2FF] text-[#2548C9]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            Money to pay (2)
          </button>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Search by invoice number or party..."
          searchKey={(item) => `${item.invoiceNo} ${item.party}`}
          pageSize={10}
        />
      </Card>

      {/* Upload Invoice PDF Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload invoice"
        description="We will read the party name, amount, GSTIN and due date from the PDF automatically."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setUploadModalOpen(false);
                success('Invoice read', 'Saved invoice for ₹3,45,000 from Kalyani Powertrain.');
              }}
            >
              Read and save
            </Button>
          </div>
        }
      >
        <div className="p-6 border border-dashed border-[#D1D5DB] rounded-[10px] text-center bg-[#F9FAFB]">
          <FileText className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#111827]">
            Drag and drop an invoice PDF or image here
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            PDF, JPG or PNG up to 10MB
          </p>
        </div>
      </Modal>
    </div>
  );
};
