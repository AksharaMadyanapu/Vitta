import React, { useState } from 'react';
import { Upload, Plus, Building2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

interface TransactionItem {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  category: string;
  account: string;
}

export const BankingPage: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { success } = useToast();

  const mockTransactions: TransactionItem[] = [
    {
      id: 'tx-101',
      date: '8 Nov 2026',
      description: 'Kalyani Powertrain Ltd - Inv #DP-4401',
      type: 'credit',
      amount: 450000,
      category: 'Customer payment',
      account: 'HDFC Current A/c (9481)',
    },
    {
      id: 'tx-102',
      date: '7 Nov 2026',
      description: 'Tata Steel BSL Ltd - Raw material steel coils',
      type: 'debit',
      amount: 320000,
      category: 'Raw materials',
      account: 'HDFC Current A/c (9481)',
    },
    {
      id: 'tx-103',
      date: '5 Nov 2026',
      description: 'Factory electricity bill - TSSPDCL',
      type: 'debit',
      amount: 68400,
      category: 'Electricity',
      account: 'SBI Overdraft A/c (1102)',
    },
    {
      id: 'tx-104',
      date: '3 Nov 2026',
      description: 'Sundaram Fasteners - Auto component parts',
      type: 'credit',
      amount: 580000,
      category: 'Customer payment',
      account: 'HDFC Current A/c (9481)',
    },
    {
      id: 'tx-105',
      date: '1 Nov 2026',
      description: 'Staff salaries and factory wages (November)',
      type: 'debit',
      amount: 420000,
      category: 'Salaries',
      account: 'HDFC Current A/c (9481)',
    },
  ];

  const columns: Column<TransactionItem>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      className: 'text-xs text-[#6B7280]',
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (tx) => (
        <div>
          <span className="font-medium text-[#111827] text-sm">{tx.description}</span>
          <p className="text-xs text-[#6B7280]">{tx.account}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (tx) => (
        <span className="text-xs text-[#4B5563]">
          {tx.category}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (tx) => {
        const isCredit = tx.type === 'credit';
        return (
          <span
            className={
              isCredit
                ? 'text-[#15803D] font-medium'
                : 'text-[#111827] font-medium'
            }
          >
            {isCredit ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank and transactions"
        description="See your current bank balance and recent money coming in and going out."
        action={
          <Button
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload statement
          </Button>
        }
        secondaryAction={
          <Button
            variant="secondary"
            onClick={() => success('Transaction added', 'Manual transaction recorded in ledger.')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add entry
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total cash available"
          value={1845200}
          subtitle="Across 2 accounts"
        />
        <StatCard
          title="HDFC Current Account"
          value={1425200}
          subtitle="A/c ****9481 · Connected"
        />
        <StatCard
          title="SBI Overdraft / Credit"
          value={420000}
          subtitle="Available limit: ₹15,00,000"
        />
      </div>

      {/* Transactions Table Card */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="text-base font-semibold text-[#111827]">
              Recent transactions
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              From your connected bank accounts and uploaded statements
            </p>
          </div>
          <span className="text-xs text-[#6B7280]">
            5 entries
          </span>
        </div>

        <DataTable
          data={mockTransactions}
          columns={columns}
          searchPlaceholder="Search transactions..."
          searchKey={(item) => `${item.description} ${item.category} ${item.account}`}
          pageSize={10}
        />
      </Card>

      {/* Upload Statement Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload bank statement"
        description="Select a CSV file downloaded from your bank (HDFC, SBI, ICICI, etc.)."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setUploadModalOpen(false);
                success('Statement uploaded', '14 transactions imported and reconciled.');
              }}
            >
              Import statement
            </Button>
          </div>
        }
      >
        <div className="p-6 border border-dashed border-[#D1D5DB] rounded-[10px] text-center bg-[#F9FAFB]">
          <Upload className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#111827]">
            Drag and drop your statement CSV here, or click to browse
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            Files up to 10MB (CSV, XLS)
          </p>
        </div>
      </Modal>
    </div>
  );
};
