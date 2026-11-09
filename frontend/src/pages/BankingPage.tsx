import React, { useState } from 'react';
import {
  Landmark,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SkeletonStatCard, SkeletonTable } from '@/components/ui/Skeleton';
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
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { success } = useToast();

  const mockTransactions: TransactionItem[] = [
    {
      id: 'tx-101',
      date: '2026-11-08',
      description: 'NEFT: Kalyani Powertrain Ltd - Inv #DP-4401',
      type: 'credit',
      amount: 450000,
      category: 'Customer Receivable',
      account: 'HDFC Current A/c - 9481',
    },
    {
      id: 'tx-102',
      date: '2026-11-07',
      description: 'RTGS: Tata Steel BSL Ltd - Raw Material Coil',
      type: 'debit',
      amount: 320000,
      category: 'Raw Materials',
      account: 'HDFC Current A/c - 9481',
    },
    {
      id: 'tx-103',
      date: '2026-11-05',
      description: 'ACH: Factory Power Utility Bill - TSSPDCL',
      type: 'debit',
      amount: 68400,
      category: 'Utilities / Power',
      account: 'SBI OD A/c - 1102',
    },
    {
      id: 'tx-104',
      date: '2026-11-03',
      description: 'NEFT: Sundaram Fasteners Auto Components',
      type: 'credit',
      amount: 580000,
      category: 'Customer Receivable',
      account: 'HDFC Current A/c - 9481',
    },
    {
      id: 'tx-105',
      date: '2026-11-01',
      description: 'Bank Transfer: Staff Salary Dispatch (Nov 1)',
      type: 'debit',
      amount: 420000,
      category: 'Payroll & Wages',
      account: 'HDFC Current A/c - 9481',
    },
  ];

  const columns: Column<TransactionItem>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      className: 'font-mono text-xs text-primary-muted',
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (tx) => (
        <div>
          <p className="font-medium text-primary text-sm">{tx.description}</p>
          <span className="text-[11px] text-primary-muted">{tx.account}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (tx) => (
        <span className="text-xs px-2 py-0.5 rounded-md bg-elevated border border-border text-primary-muted">
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
                ? 'text-risk-safe font-semibold'
                : 'text-primary font-semibold'
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
        title="Bank Accounts & Transactions"
        description="Connect real-time bank sandbox feeds, upload bank CSV statements, and inspect live ledger activities."
        badge={
          <Badge variant="teal" dot>
            Simulated Sandbox Active
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeleton(!showSkeleton)}
            >
              {showSkeleton ? 'View Content' : 'Preview Skeletons'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => success('Transaction Added', 'New ledger manual adjustment saved.')}
            >
              Manual Entry
            </Button>
          </div>
        }
      />

      {showSkeleton ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <SkeletonTable rows={5} />
        </div>
      ) : (
        <>
          {/* Bank Accounts Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="HDFC Current Account"
              value={1425200}
              change={5.2}
              changeLabel="balance growth"
              icon={Landmark}
              variant="blue"
              subtitle="A/c No: ****9481 · Connected Sandbox"
            />
            <StatCard
              title="SBI Cash Credit / Overdraft"
              value={420000}
              change={-1.5}
              changeLabel="utilization headroom"
              icon={Landmark}
              variant="teal"
              subtitle="Limit: ₹15,00,000 · A/c No: ****1102"
            />
            <StatCard
              title="Total Available Working Cash"
              value={1845200}
              change={3.9}
              changeLabel="combined balance"
              icon={Landmark}
              variant="safe"
              subtitle="Net liquid reserves across all accounts"
            />
          </div>

          {/* Transactions DataTable */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
              <div>
                <h3 className="text-base font-semibold text-primary">
                  Recent Ledger Transactions
                </h3>
                <p className="text-xs text-primary-muted mt-0.5">
                  Synchronized from connected accounts and CSV imports
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                5 Entries
              </Badge>
            </div>

            <DataTable
              data={mockTransactions}
              columns={columns}
              searchPlaceholder="Search by description, account, category..."
              searchKey={(item) => `${item.description} ${item.category} ${item.account}`}
              pageSize={5}
            />
          </Card>
        </>
      )}

      {/* CSV Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Bank Statement CSV"
        description="Select a CSV file downloaded from HDFC, SBI, ICICI or Axis Bank."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setUploadModalOpen(false);
                success('CSV Uploaded', 'Parsed 14 new transactions successfully.');
              }}
            >
              Parse & Reconcile
            </Button>
          </div>
        }
      >
        <div className="p-6 border-2 border-dashed border-border rounded-xl text-center hover:border-accent-blue/50 transition-colors cursor-pointer bg-elevated/40">
          <FileSpreadsheet className="w-10 h-10 text-accent-blue mx-auto mb-2" />
          <p className="text-sm font-medium text-primary">
            Drag and drop statement CSV here
          </p>
          <p className="text-xs text-primary-muted mt-1">
            Supports standard formats: Date, Description, Debit, Credit, Balance
          </p>
        </div>
      </Modal>
    </div>
  );
};

