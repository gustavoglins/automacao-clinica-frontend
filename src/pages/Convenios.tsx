import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConvenios } from '@/context';
import { Convenio } from '@/types/convenio';
import { convenioService } from '@/services/convenioService';
import { toast } from 'sonner';
import {
  ConvenioFilters,
  ConvenioDataList,
  ConvenioFormDialog,
  DeleteConvenioDialog,
} from '@/components/convenios';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Building2, Map, Shield, Activity } from 'lucide-react';

interface ConvenioFormData {
  nome: string;
  abrangencia: string;
  tipo_cobertura: string;
  telefone_contato: string;
  email_contato: string;
  observacoes: string;
  ativo: boolean;
}

const ConveniosPage: React.FC = () => {
  const { convenios, setConvenios, loading } = useConvenios();
  const [filtered, setFiltered] = useState<Convenio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [coberturaFilter, setCoberturaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [selected, setSelected] = useState<Convenio | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ConvenioFormData>({
    nome: '',
    abrangencia: '',
    tipo_cobertura: '',
    telefone_contato: '',
    email_contato: '',
    observacoes: '',
    ativo: true,
  });

  // Buscar query na URL (ex: atalho de pesquisa)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
      navigate('/convenios', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    setFiltered(convenios);
  }, [convenios]);

  useEffect(() => {
    let list = convenios;
    if (searchTerm) {
      list = list.filter((c) =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Abrangência filter removed
    if (coberturaFilter !== 'all') {
      list = list.filter((c) => c.tipo_cobertura === coberturaFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((c) =>
        statusFilter === 'active' ? c.ativo : !c.ativo
      );
    }
    setFiltered(list);
  }, [convenios, searchTerm, coberturaFilter, statusFilter]);

  const resetForm = () => {
    setFormData({
      nome: '',
      abrangencia: '',
      tipo_cobertura: '',
      telefone_contato: '',
      email_contato: '',
      observacoes: '',
      ativo: true,
    });
  };

  const openAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEdit = (c: Convenio) => {
    setSelected(c);
    setFormData({
      nome: c.nome,
      abrangencia: c.abrangencia,
      tipo_cobertura: c.tipo_cobertura,
      telefone_contato: c.telefone_contato || '',
      email_contato: c.email_contato || '',
      observacoes: c.observacoes || '',
      ativo: c.ativo,
    });
    setIsEditOpen(true);
  };

  const openDelete = (c: Convenio) => {
    setSelected(c);
    setIsDeleteOpen(true);
  };

  const handleAdd = async () => {
    if (!formData.nome || !formData.abrangencia || !formData.tipo_cobertura) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    try {
      const created = await convenioService.create({
        nome: formData.nome,
        abrangencia: formData.abrangencia,
        tipo_cobertura: formData.tipo_cobertura,
        telefone_contato: formData.telefone_contato || undefined,
        email_contato: formData.email_contato || undefined,
        observacoes: formData.observacoes || undefined,
        ativo: formData.ativo,
      });
      setConvenios((prev) => [...prev, created]);
      setIsAddOpen(false);
      resetForm();
    } catch (e) {
      console.error('Erro ao criar convênio', e);
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    if (!formData.nome || !formData.abrangencia || !formData.tipo_cobertura) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    try {
      const updated = await convenioService.update({
        id: selected.id,
        nome: formData.nome,
        abrangencia: formData.abrangencia,
        tipo_cobertura: formData.tipo_cobertura,
        telefone_contato: formData.telefone_contato || undefined,
        email_contato: formData.email_contato || undefined,
        observacoes: formData.observacoes || undefined,
        ativo: formData.ativo,
      });
      setConvenios((prev) =>
        prev.map((c) => (c.id === selected.id ? updated : c))
      );
      setIsEditOpen(false);
      setSelected(null);
      resetForm();
    } catch (e) {
      console.error('Erro ao atualizar convênio', e);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsDeleteLoading(true);
    try {
      await convenioService.delete(selected.id);
      setConvenios((prev) => prev.filter((c) => c.id !== selected.id));
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (e) {
      console.error('Erro ao remover convênio', e);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const hasFilters =
    searchTerm !== '' || coberturaFilter !== 'all' || statusFilter !== 'all';

  // Estatísticas simples
  const total = convenios.length;
  const ativos = convenios.filter((c) => c.ativo).length;
  const inativos = total - ativos;
  const totalNacional = convenios.filter((c) =>
    /nacional/i.test(c.abrangencia)
  ).length;
  const principalCobertura = (() => {
    if (convenios.length === 0) return 'N/A';
    const counts: Record<string, number> = {};
    convenios.forEach((c) => {
      counts[c.tipo_cobertura] = (counts[c.tipo_cobertura] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Convênios
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie os convênios aceitos pela clínica
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatsCard
            title="Total de Convênios"
            value={total}
            icon={Building2}
          />
          <StatsCard
            title="Convênios Nacionais"
            value={totalNacional}
            icon={Map}
          />
          <StatsCard
            title="Cobertura Predominante"
            value={principalCobertura}
            icon={Shield}
          />
          <StatsCard
            title="Ativos x Inativos"
            value={`${ativos} / ${inativos}`}
            icon={Activity}
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <ConvenioFilters
            searchTerm={searchTerm}
            coberturaFilter={coberturaFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onCoberturaChange={setCoberturaFilter}
            onStatusChange={setStatusFilter}
            onAddNew={openAdd}
          />

          <ConvenioDataList
            convenios={filtered}
            onEdit={openEdit}
            onDelete={openDelete}
            onAddNew={openAdd}
            pagination="paged"
            pageSize={9}
            height="600px"
            hasFilters={hasFilters}
          />
        </div>

        <ConvenioFormDialog
          isOpen={isAddOpen}
          onOpenChange={setIsAddOpen}
          title="Novo Convênio"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAdd}
          onCancel={() => {
            setIsAddOpen(false);
            resetForm();
          }}
          loading={loading}
          submitLabel="Salvar"
        />

        <ConvenioFormDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          title="Editar Convênio"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditOpen(false);
            setSelected(null);
            resetForm();
          }}
          loading={loading}
          submitLabel="Salvar"
        />

        <DeleteConvenioDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          convenio={selected}
          onConfirm={handleDelete}
          isLoading={isDeleteLoading}
        />
      </div>
    </AppLayout>
  );
};

export default ConveniosPage;
