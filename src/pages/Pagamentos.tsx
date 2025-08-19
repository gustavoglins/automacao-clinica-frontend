import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { PaymentMethod } from '@/types/paymentMethod';
import { paymentMethodService } from '@/services/paymentMethodService';
import { toast } from 'sonner';
import {
  PaymentMethodDataList,
  PaymentMethodFilters,
  PaymentMethodFormDialog,
} from '@/components/pagamentos';
import { DeletePaymentMethodDialog } from '@/components/pagamentos/DeletePaymentMethodDialog';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CreditCard, Activity, CheckCircle2, XCircle } from 'lucide-react';

interface PaymentMethodFormData {
  name: string;
  description: string;
  active: boolean;
}

const PagamentosPage: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [filtered, setFiltered] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<PaymentMethod | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await paymentMethodService.getAll();
        setMethods(data);
        setFiltered(data);
      } catch {
        // toast já mostrado no service
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Buscar query na URL (ex: atalho de pesquisa)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
      navigate('/pagamentos', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    let list = methods;
    if (searchTerm) {
      list = list.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((m) =>
        statusFilter === 'active' ? m.active : !m.active
      );
    }
    setFiltered(list);
  }, [methods, searchTerm, statusFilter]);

  const resetForm = () => {
    setFormData({ name: '', description: '', active: true });
  };

  const openAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setSelected(m);
    setFormData({
      name: m.name,
      description: m.description || '',
      active: m.active,
    });
    setIsEditOpen(true);
  };

  const openDelete = (m: PaymentMethod) => {
    setSelected(m);
    setIsDeleteOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error('Preencha o nome do método');
      return;
    }
    try {
      const created = await paymentMethodService.create({
        name: formData.name,
        description: formData.description || undefined,
        active: formData.active,
      });
      setMethods((prev) => [...prev, created]);
      setIsAddOpen(false);
      resetForm();
    } catch (e) {
      console.error('Erro ao criar método de pagamento', e);
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    if (!formData.name) {
      toast.error('Preencha o nome do método');
      return;
    }
    try {
      const updated = await paymentMethodService.update({
        id: selected.id,
        name: formData.name,
        description: formData.description || undefined,
        active: formData.active,
      });
      setMethods((prev) =>
        prev.map((m) => (m.id === selected.id ? updated : m))
      );
      setIsEditOpen(false);
      setSelected(null);
      resetForm();
    } catch (e) {
      console.error('Erro ao atualizar método de pagamento', e);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      await paymentMethodService.delete(selected.id);
      setMethods((prev) => prev.filter((m) => m.id !== selected.id));
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (e) {
      console.error('Erro ao remover método de pagamento', e);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFilters = searchTerm !== '' || statusFilter !== 'all';

  const total = methods.length;
  const ativos = methods.filter((m) => m.active).length;
  const inativos = total - ativos;

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Pagamentos
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie as formas de pagamento aceitas pela clínica
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatsCard title="Total de Métodos" value={total} icon={CreditCard} />
          <StatsCard title="Ativos" value={ativos} icon={CheckCircle2} />
          <StatsCard title="Inativos" value={inativos} icon={XCircle} />
          <StatsCard
            title="Status"
            value={`${ativos} / ${inativos}`}
            icon={Activity}
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <PaymentMethodFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onAddNew={openAdd}
          />

          <PaymentMethodDataList
            methods={filtered}
            onEdit={openEdit}
            onDelete={openDelete}
            onAddNew={openAdd}
            pagination="paged"
            pageSize={9}
            height="600px"
            hasFilters={hasFilters}
          />
        </div>

        <PaymentMethodFormDialog
          isOpen={isAddOpen}
          onOpenChange={setIsAddOpen}
          title="Novo Método de Pagamento"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAdd}
          onCancel={() => {
            setIsAddOpen(false);
            resetForm();
          }}
          loading={isLoading}
          submitLabel="Salvar"
        />

        <PaymentMethodFormDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          title="Editar Método de Pagamento"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditOpen(false);
            setSelected(null);
            resetForm();
          }}
          loading={isLoading}
          submitLabel="Salvar"
        />

        <DeletePaymentMethodDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          method={selected}
          onConfirm={handleDelete}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default PagamentosPage;
