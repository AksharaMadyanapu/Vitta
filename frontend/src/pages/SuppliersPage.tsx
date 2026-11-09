import React from 'react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string;
  email: string;
  terms: number;
  openPayable: number;
}

export const SuppliersPage: React.FC = () => {
  const { success } = useToast();

  const suppliers: Supplier[] = [
    {
      id: 's-1',
      name: 'Tata Steel BSL Ltd',
      category: 'Raw materials (steel coils)',
      contact: 'Amit Sengupta',
      email: 'asengupta@tatasteel.com',
      terms: 30,
      openPayable: 480000,
    },
    {
      id: 's-2',
      name: 'Hindalco Industrial Extrusions',
      category: 'Raw materials (aluminum)',
      contact: 'Pooja Agarwal',
      email: 'p.agarwal@adityabirla.com',
      terms: 15,
      openPayable: 220000,
    },
    {
      id: 's-3',
      name: 'Sandvik Coromant India',
      category: 'Tooling and cutting inserts',
      contact: 'Vikas Kulkarni',
      email: 'vkulkarni@sandvik.com',
      terms: 30,
      openPayable: 85000,
    },
    {
      id: 's-4',
      name: 'TSSPDCL Industrial Electricity',
      category: 'Factory high-tension power',
      contact: 'Divisional Accounts Desk',
      email: 'accounts@tsspdcl.gov.in',
      terms: 15,
      openPayable: 95000,
    },
    {
      id: 's-5',
      name: 'Industrial Tooling Solutions',
      category: 'Machining consumables',
      contact: 'Kiran Reddy',
      email: 'kiran@indtooling.com',
      terms: 30,
      openPayable: 45000,
    },
  ];

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      header: 'Supplier name',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-medium text-[#111827]">{s.name}</span>
          <p className="text-xs text-[#6B7280]">{s.category}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      sortable: true,
      render: (s) => (
        <div>
          <span className="text-sm text-[#374151]">{s.contact}</span>
          <p className="text-xs text-[#6B7280]">{s.email}</p>
        </div>
      ),
    },
    {
      key: 'terms',
      header: 'Payment terms',
      align: 'center',
      sortable: true,
      render: (s) => (
        <span className="text-xs text-[#374151]">
          {s.terms} days
        </span>
      ),
    },
    {
      key: 'openPayable',
      header: 'Amount to pay',
      align: 'right',
      sortable: true,
      render: (s) => (
        <span className="font-medium text-[#111827] tabular-nums">
          {formatINR(s.openPayable)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="See who supplies your factory, agreed credit periods, and bills you need to pay."
        action={
          <Button
            variant="primary"
            onClick={() => success('New supplier', 'Opening supplier form...')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add supplier
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total bills to pay"
          value={925000}
          subtitle="Across 5 active suppliers"
        />
        <StatCard
          title="Due in next 14 days"
          value={700000}
          subtitle="Tata Steel and Hindalco"
          statusVariant="caution"
        />
        <StatCard
          title="Active suppliers"
          value={8}
          isCurrency={false}
          suffix=" suppliers"
          subtitle="All accounts in good standing"
          statusVariant="safe"
        />
      </div>

      <Card>
        <DataTable
          data={suppliers}
          columns={columns}
          searchPlaceholder="Search suppliers by name or category..."
          searchKey={(s) => `${s.name} ${s.category} ${s.contact}`}
          pageSize={10}
        />
      </Card>
    </div>
  );
};

