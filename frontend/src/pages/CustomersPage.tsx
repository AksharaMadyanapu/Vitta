import React from 'react';
import { Plus, Mail, Phone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatINR } from '@/utils/format';
import { useToast } from '@/components/ui/Toast';

interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  terms: number;
  avgDelay: number;
  openBalance: number;
  status: 'safe' | 'caution' | 'danger';
}

export const CustomersPage: React.FC = () => {
  const { success } = useToast();

  const customers: Customer[] = [
    {
      id: 'c-1',
      name: 'Sundaram Fasteners Ltd',
      contact: 'Anand Natarajan',
      email: 'a.natarajan@sundaram.in',
      phone: '+91 98401 22345',
      terms: 45,
      avgDelay: 2,
      openBalance: 840000,
      status: 'safe',
    },
    {
      id: 'c-2',
      name: 'Kalyani Powertrain Ltd',
      contact: 'Suresh Kumar',
      email: 'suresh.k@kalyanipower.com',
      phone: '+91 98220 11984',
      terms: 30,
      avgDelay: 14,
      openBalance: 640000,
      status: 'caution',
    },
    {
      id: 'c-3',
      name: 'Varroc Engineering Components',
      contact: 'Mahesh Patil',
      email: 'mpatil@varroc.com',
      phone: '+91 94222 88412',
      terms: 60,
      avgDelay: 24,
      openBalance: 1120000,
      status: 'danger',
    },
    {
      id: 'c-4',
      name: 'Endurance Technologies Ltd',
      contact: 'Ramesh Verma',
      email: 'rverma@endurance.co.in',
      phone: '+91 98900 44211',
      terms: 30,
      avgDelay: 8,
      openBalance: 420000,
      status: 'caution',
    },
    {
      id: 'c-5',
      name: 'Motherson Automotive Parts',
      contact: 'Praveen Shah',
      email: 'pshah@motherson.com',
      phone: '+91 99100 88231',
      terms: 45,
      avgDelay: 3,
      openBalance: 590000,
      status: 'safe',
    },
  ];

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer name',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-medium text-[#111827]">{c.name}</span>
          <p className="text-xs text-[#6B7280]">{c.contact} · {c.phone}</p>
        </div>
      ),
    },
    {
      key: 'terms',
      header: 'Agreed terms',
      align: 'center',
      sortable: true,
      render: (c) => (
        <span className="text-xs text-[#374151]">
          {c.terms} days
        </span>
      ),
    },
    {
      key: 'avgDelay',
      header: 'Usual payment delay',
      align: 'center',
      sortable: true,
      render: (c) => {
        if (c.avgDelay <= 3) {
          return <Badge variant="safe">Pays on time</Badge>;
        }
        if (c.avgDelay > 15) {
          return <Badge variant="danger">~{c.avgDelay} days late</Badge>;
        }
        return <Badge variant="caution">~{c.avgDelay} days late</Badge>;
      },
    },
    {
      key: 'openBalance',
      header: 'Balance owed to you',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-medium text-[#111827] tabular-nums">
          {formatINR(c.openBalance)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="See payment terms, how late customers usually pay, and how much they owe you."
        action={
          <Button
            variant="primary"
            onClick={() => success('New customer', 'Opening customer form...')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add customer
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total balance owed to you"
          value={3610000}
          subtitle="Across 12 active customers"
        />
        <StatCard
          title="Customers paying on time"
          value={7}
          isCurrency={false}
          suffix=" customers"
          subtitle="Usually pay within terms"
          statusVariant="safe"
        />
        <StatCard
          title="Customers paying late"
          value={5}
          isCurrency={false}
          suffix=" customers"
          subtitle="Average delay over 10 days"
          statusVariant="caution"
        />
      </div>

      <Card>
        <DataTable
          data={customers}
          columns={columns}
          searchPlaceholder="Search customers by name or contact..."
          searchKey={(c) => `${c.name} ${c.contact} ${c.email}`}
          pageSize={10}
        />
      </Card>
    </div>
  );
};

