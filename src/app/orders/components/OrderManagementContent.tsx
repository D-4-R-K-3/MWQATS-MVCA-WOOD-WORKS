'use client';

import React, { useMemo, useState } from 'react';
import { Search, Clock, Truck, ClipboardCheck, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

const orderStages = ['Pending', 'Approved', 'In Production', 'Assembly', 'Quality Check', 'Ready for Delivery', 'Delivered'];

const orders = [
  {
    id: 'ORD-4421',
    customer: 'Claire Leblanc',
    total: '$2,160',
    status: 'In Production',
    stage: 'Sanding',
    due: 'May 18',
    assigned: 'MR',
  },
  {
    id: 'ORD-4418',
    customer: 'Mark Walton',
    total: '$1,420',
    status: 'Quality Check',
    stage: 'QC',
    due: 'May 15',
    assigned: 'SK',
  },
  {
    id: 'ORD-4409',
    customer: 'Nina Park',
    total: '$980',
    status: 'Ready for Delivery',
    stage: 'Shipping Prep',
    due: 'May 16',
    assigned: 'JT',
  },
  {
    id: 'ORD-4432',
    customer: 'Jared Stone',
    total: '$3,520',
    status: 'Pending Approval',
    stage: 'Design Review',
    due: 'May 20',
    assigned: 'DK',
  },
];

export default function OrderManagementContent() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(orders?.[0]?.id);
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredOrders = useMemo(() => {
    return orders?.filter((order) => {
      const matchesSearch = order?.id?.toLowerCase()?.includes(search?.toLowerCase()) || order?.customer?.toLowerCase()?.includes(search?.toLowerCase());
      const matchesStatus = filterStatus === 'All' || order?.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, search]);

  const activeOrder = orders?.find((order) => order?.id === selectedOrder) ?? orders?.[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.24em] mb-2">Order Management</p>
          <h1 className="text-3xl font-bold text-foreground">Track work orders and delivery stages</h1>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full max-w-2xl">
          {['All', 'In Production', 'Quality Check', 'Delivered']?.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
                filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 xl:flex-row">
        <section className="xl:w-[55%] card-dark rounded-3xl border border-border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Active orders</h2>
              <p className="text-sm text-muted-foreground mt-1">Search and filter the current order pipeline.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event?.target?.value)}
                placeholder="Search orders"
                className="input-dark w-full pl-11"
              />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Assigned</th>
                  <th className="px-4 py-3">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders?.map((order) => (
                  <tr
                    key={order?.id}
                    onClick={() => setSelectedOrder(order?.id)}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedOrder === order?.id ? 'bg-primary/10' : ''}`}
                  >
                    <td className="px-4 py-4 font-semibold text-foreground">{order?.id}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{order?.stage}</td>
                    <td className="px-4 py-4 text-muted-foreground">{order?.assigned}</td>
                    <td className="px-4 py-4 text-muted-foreground">{order?.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="xl:w-[45%] space-y-4">
          <section className="card-dark rounded-3xl border border-border p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Order details</h2>
                <p className="text-sm text-muted-foreground mt-1">Review the selected order status timeline.</p>
              </div>
              <StatusBadge
                variant={activeOrder?.status?.includes('Delivered') ? 'ok' : activeOrder?.status?.includes('Pending') ? 'warning' : activeOrder?.status?.includes('Quality') ? 'info' : 'neutral'}
                label={activeOrder?.status}
              />
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex justify-between gap-4">
                <span>Customer</span>
                <span className="text-foreground font-semibold">{activeOrder?.customer}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Order value</span>
                <span className="text-foreground font-semibold">{activeOrder?.total}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Due date</span>
                <span className="text-foreground font-semibold">{activeOrder?.due}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Assigned worker</span>
                <span className="text-foreground font-semibold">{activeOrder?.assigned}</span>
              </div>
              <div className="rounded-3xl bg-muted p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-3">
                  <span>Production progress</span>
                  <span>{orderStages?.indexOf(activeOrder?.status) + 1}/{orderStages?.length}</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${((orderStages?.indexOf(activeOrder?.status) + 1) / orderStages?.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="card-dark rounded-3xl border border-border p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock size={18} className="text-accent" />
              <h3 className="text-base font-semibold text-foreground">Status timeline</h3>
            </div>
            <div className="space-y-4">
              {orderStages?.map((stage, index) => {
                const completed = orderStages?.indexOf(activeOrder?.status) >= index;
                return (
                  <div key={stage} className="flex items-start gap-3">
                    <span className={`mt-1 h-3.5 w-3.5 rounded-full ${completed ? 'bg-success' : 'bg-border'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>{stage}</p>
                      <p className="text-xs text-muted-foreground">{completed ? 'Completed' : 'Pending'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card-dark rounded-3xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Actions</h2>
              <span className="text-xs text-muted-foreground">Quick update</span>
            </div>
            <div className="space-y-3">
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <ClipboardCheck size={16} /> Approve order
              </button>
              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <Truck size={16} /> Schedule delivery
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted py-3 text-sm text-muted-foreground hover:bg-muted/80 transition-all">
                <ChevronRight size={16} /> View order workflow
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
