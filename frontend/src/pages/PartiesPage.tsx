import React, { useState } from 'react';
import { Users, Building, ShieldAlert, Plus, Phone, Mail } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

interface Party {
  id: string;
  name: string;
  type: 'customer' | 'supplier';
  contact: string;
  email: string;
  terms: number;
  avgDelay: number;
  risk: 'safe' | 'caution' | 'high';
  openVolume: number;
}

export const PartiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { success } = useToast();

  const mockParties: Party[] = [
    {
      id: 'p-1',
      name: 'Kalyani Powertrain Ltd',
      type: 'customer',
      contact: 'Suresh Kumar',
      email: 'suresh.k@kalyanipower.com',
      terms: 30,
      avgDelay: 14.2,
      risk: 'caution',
      openVolume: 1250000,
    },
    {
      id: 'p-2',
      name: 'Sundaram Fasteners Auto Components',
      type: 'customer',
      contact: 'Anand Natarajan',
      email: 'a.natarajan@sundaram.in',
      terms: 45,
      avgDelay: 2.1,
      risk: 'safe',
      openVolume: 840000,
    },
    {
      id: 'p-3',
      name: 'Varroc Engineering Components',
      type: 'customer',
      contact: 'Mahesh Patil',
      email: 'mpatil@varroc.com',
      terms: 60,
      avgDelay: 24.5,
      risk: 'high',
      openVolume: 1680000,
    },
    {
      id: 'p-4',
      name: 'Tata Steel BSL Raw Material Division',
      type: 'supplier',
      contact: 'Amit Sengupta',
      email: 'asengupta@tatasteel.com',
      terms: 30,
      avgDelay: 0.0,
      risk: 'safe',
      openVolume: 720000,
    },
    {
      id: 'p-5',
      name: 'Hindalco Industrial Extrusions',
      type: 'supplier',
      contact: 'Pooja Agarwal',
      email: 'p.agarwal@adityabirla.com',
      terms: 15,
      avgDelay: 1.5,
      risk: 'safe',
      openVolume: 350000,
    },
  ];

  const filteredParties = mockParties.filter((p) => p.type === activeTab);

  const columns: Column<Party>[] = [
    {
      key: 'name',
      header: 'Entity Name',
      sortable: true,
      render: (party) => (
        <div>
          <span className="font-semibold text-primary">{party.name}</span>
          <div className="flex items-center gap-3 text-[11px] text-primary-muted mt-0.5">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {party.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Person',
      sortable: true,
    },
    {
      key: 'terms',
      header: 'Terms',
      align: 'center',
      sortable: true,
      render: (party) => (
        <span className="font-mono text-xs text-primary">
          {party.terms} Days
        </span>
      ),
    },
    {
      key: 'avgDelay',
      header: 'Avg Delay',
      align: 'center',
      sortable: true,
      render: (party) => {
        const isLate = party.avgDelay > 10;
        return (
          <span
            className={
              isLate
                ? 'font-mono text-xs font-semibold text-risk-high'
                : 'font-mono text-xs text-primary'
            }
          >
            +{party.avgDelay.toFixed(1)} Days
          </span>
        );
      },
    },
    {
      key: 'risk',
      header: 'Risk Level',
      align: 'center',
      sortable: true,
      render: (party) => (
        <Badge variant={party.risk} size="sm" dot>
          {party.risk === 'high' ? 'High Risk' : party.risk === 'caution' ? 'Moderate' : 'Safe'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers & Suppliers"
        description="Directory of 12 automotive OEM customers and 8 raw material suppliers with behavioral payment delay profiles."
        badge={
          <Badge variant="blue" size="sm">
            20 Counterparties
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
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => success('Add Counterparty', 'Opening partner onboarding modal...')}
            >
              Add Partner
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'customer'
              ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30 shadow-sm'
              : 'text-primary-muted hover:text-primary hover:bg-elevated'
          }`}
        >
          Customers (12)
        </button>
        <button
          onClick={() => setActiveTab('supplier')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'supplier'
              ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30 shadow-sm'
              : 'text-primary-muted hover:text-primary hover:bg-elevated'
          }`}
        >
          Suppliers (8)
        </button>
      </div>

      {showSkeleton ? (
        <SkeletonTable rows={5} />
      ) : (
        <Card className="p-6">
          <DataTable
            data={filteredParties}
            columns={columns}
            searchPlaceholder={`Search ${activeTab}s by name or contact...`}
            pageSize={10}
          />
        </Card>
      )}
    </div>
  );
};

