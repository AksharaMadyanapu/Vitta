import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SkeletonStatCard, SkeletonTable } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  counterparty: string;
  type: 'receivable' | 'payable';
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  extractedViaOCR: boolean;
}

export const InvoicesPage: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const { success } = useToast();

  const mockInvoices: InvoiceItem[] = [
    {
      id: 'inv-1',
      invoiceNo: 'INV/2026/0491',
      counterparty: 'Kalyani Powertrain Ltd',
      type: 'receivable',
      amount: 640000,
      dueDate: '2026-11-16',
      status: 'unpaid',
      extractedViaOCR: true,
    },
    {
      id: 'inv-2',
      invoiceNo: 'INV/2026/0478',
      counterparty: 'Varroc Engineering Components',
      type: 'receivable',
      amount: 1120000,
      dueDate: '2026-11-04',
      status: 'overdue',
      extractedViaOCR: false,
    },
    {
      id: 'inv-3',
      invoiceNo: 'PO/TS/8812',
      counterparty: 'Tata Steel BSL Raw Material Division',
      type: 'payable',
      amount: 480000,
      dueDate: '2026-11-20',
      status: 'unpaid',
      extractedViaOCR: true,
    },
    {
      id: 'inv-4',
      invoiceNo: 'INV/2026/0430',
      counterparty: 'Sundaram Fasteners Auto Components',
      type: 'receivable',
      amount: 750000,
      dueDate: '2026-10-28',
      status: 'paid',
      extractedViaOCR: true,
    },
    {
      id: 'inv-5',
      invoiceNo: 'PO/HE/9102',
      counterparty: 'Hindalco Industrial Extrusions',
      type: 'payable',
      amount: 220000,
      dueDate: '2026-11-25',
      status: 'unpaid',
      extractedViaOCR: false,
    },
  ];

  const columns: Column<InvoiceItem>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice #',
      sortable: true,
      render: (inv) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-muted shrink-0" />
          <div>
            <span className="font-semibold text-primary">{inv.invoiceNo}</span>
            {inv.extractedViaOCR && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent-teal/15 text-accent-teal font-medium border border-accent-teal/30">
                PDF Extracted
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'counterparty',
      header: 'Party',
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      align: 'center',
      render: (inv) => (
        <Badge
          variant={inv.type === 'receivable' ? 'teal' : 'neutral'}
          size="sm"
        >
          {inv.type === 'receivable' ? 'Receivable (Inflow)' : 'Payable (Outflow)'}
        </Badge>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      className: 'font-mono text-xs text-primary-muted',
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      render: (inv) => (
        <span
          className={
            inv.type === 'receivable'
              ? 'font-semibold text-risk-safe'
              : 'font-semibold text-primary'
          }
        >
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
        const variant =
          inv.status === 'paid'
            ? 'safe'
            : inv.status === 'overdue'
            ? 'high'
            : 'caution';
        return (
          <Badge variant={variant} size="sm" dot>
            {inv.status.toUpperCase()}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Extraction"
        description="Track all open customer receivables, supplier payables, and upload PDF invoices for automated field extraction."
        badge={
          <Badge variant="blue" size="sm">
            5 Invoices Active
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
              onClick={() => setOcrModalOpen(true)}
            >
              Upload PDF / OCR
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => success('Create Invoice', 'Opening new invoice editor...')}
            >
              Create Invoice
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Open Receivables"
              value={2510000}
              change={6.4}
              changeLabel="from 4 customers"
              icon={Clock}
              variant="teal"
              subtitle="Expected within next 30 days"
            />
            <StatCard
              title="Open Payables"
              value={700000}
              change={-2.1}
              changeLabel="to 2 suppliers"
              icon={AlertCircle}
              variant="caution"
              subtitle="Due within next 30 days"
            />
            <StatCard
              title="Overdue Receivables"
              value={1120000}
              change={12.0}
              changeLabel="Varroc Engineering"
              icon={AlertCircle}
              variant="high"
              subtitle="5 days past due date"
            />
          </div>

          <Card className="p-6">
            <DataTable
              data={mockInvoices}
              columns={columns}
              searchPlaceholder="Search invoices by number or party..."
              pageSize={10}
            />
          </Card>
        </>
      )}

      {/* PDF Upload Modal */}
      <Modal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        title="Upload Invoice PDF or Image"
        description="Runway uses pdfplumber to extract invoice number, GSTIN, due date, and amounts automatically."
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setOcrModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              onClick={() => {
                setOcrModalOpen(false);
                success('PDF Extracted', 'Extracted Invoice #DP-9921 for ₹3,45,000 from Kalyani.');
              }}
            >
              Extract & Add
            </Button>
          </div>
        }
      >
        <div className="p-8 border-2 border-dashed border-border rounded-xl text-center hover:border-accent-teal/50 transition-colors cursor-pointer bg-elevated/40">
          <Upload className="w-10 h-10 text-accent-teal mx-auto mb-2" />
          <p className="text-sm font-semibold text-primary">
            Click to upload or drag & drop invoice PDF
          </p>
          <p className="text-xs text-primary-muted mt-1">
            Accepts PDF, JPG, PNG up to 10MB
          </p>
        </div>
      </Modal>
    </div>
  );
};

