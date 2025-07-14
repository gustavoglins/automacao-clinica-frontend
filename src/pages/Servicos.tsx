import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { toast } from "sonner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Settings, TrendingUp, DollarSign, Activity } from "lucide-react";
import {
  ServiceFilters,
  ServiceList,
  ServiceFormDialog,
  DeleteServiceDialog,
  FilterDialog
} from "@/components/servicos";

// Interface para os serviços
interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  isActive: boolean;
}

const Servicos = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para filtros avançados
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: { start: null as Date | null, end: null as Date | null },
    priceRange: "",
    duration: ""
  });

  // Estados para o formulário
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    isActive: true
  });

  useEffect(() => {
    // Simula carregamento dos dados
    const loadedServices = [
      {
        id: 1,
        name: "Consulta de Rotina",
        description: "Exame clínico completo para prevenção e diagnóstico precoce",
        price: 120.00,
        duration: 30,
        category: "preventivo",
        isActive: true,
        createdAt: "2024-01-15"
      },
      {
        id: 2,
        name: "Limpeza Dental",
        description: "Profilaxia com remoção de tártaro e polimento dos dentes",
        price: 80.00,
        duration: 45,
        category: "preventivo",
        isActive: true,
        createdAt: "2024-01-15"
      },
      {
        id: 3,
        name: "Restauração em Resina",
        description: "Tratamento de cáries com material estético",
        price: 180.00,
        duration: 60,
        category: "restaurador",
        isActive: true,
        createdAt: "2024-01-15"
      },
      {
        id: 4,
        name: "Aparelho Ortodôntico",
        description: "Instalação e acompanhamento de aparelho fixo",
        price: 2500.00,
        duration: 90,
        category: "ortodontia",
        isActive: true,
        createdAt: "2024-01-15"
      },
      {
        id: 5,
        name: "Clareamento Dental",
        description: "Procedimento estético para branqueamento dos dentes",
        price: 450.00,
        duration: 120,
        category: "estetico",
        isActive: true,
        createdAt: "2024-01-15"
      },
      {
        id: 6,
        name: "Extração Simples",
        description: "Remoção de dente sem complicações",
        price: 200.00,
        duration: 30,
        category: "cirurgia",
        isActive: false,
        createdAt: "2024-01-15"
      }
    ];

    setServices(loadedServices);
    setFilteredServices(loadedServices);
  }, []);

  // Filtrar serviços
  useEffect(() => {
    let filtered = services;

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (categoryFilter !== "all") {
      filtered = filtered.filter(service => service.category === categoryFilter);
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(service =>
        statusFilter === "active" ? service.isActive : !service.isActive
      );
    }

    // Filtros avançados
    // Filtro por data de criação
    if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
      filtered = filtered.filter(service => {
        const serviceDate = new Date(service.createdAt);
        if (advancedFilters.dateRange.start && serviceDate < advancedFilters.dateRange.start) {
          return false;
        }
        if (advancedFilters.dateRange.end && serviceDate > advancedFilters.dateRange.end) {
          return false;
        }
        return true;
      });
    }

    // Filtro por faixa de preço
    if (advancedFilters.priceRange) {
      filtered = filtered.filter(service => {
        const price = service.price;
        switch (advancedFilters.priceRange) {
          case "0-100":
            return price <= 100;
          case "100-300":
            return price > 100 && price <= 300;
          case "300-500":
            return price > 300 && price <= 500;
          case "500-1000":
            return price > 500 && price <= 1000;
          case "1000+":
            return price > 1000;
          default:
            return true;
        }
      });
    }

    // Filtro por duração
    if (advancedFilters.duration) {
      filtered = filtered.filter(service => {
        const duration = service.duration;
        switch (advancedFilters.duration) {
          case "0-30":
            return duration <= 30;
          case "30-60":
            return duration > 30 && duration <= 60;
          case "60-90":
            return duration > 60 && duration <= 90;
          case "90-120":
            return duration > 90 && duration <= 120;
          case "120+":
            return duration > 120;
          default:
            return true;
        }
      });
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, categoryFilter, statusFilter, advancedFilters]);

  // Funções do formulário
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
      isActive: true
    });
  };

  const handleAddService = () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newService: Service = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration) || 30,
      category: formData.category,
      isActive: formData.isActive,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setServices(prev => [...prev, newService]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Serviço adicionado com sucesso!");
  };

  const handleEditService = () => {
    if (!selectedService || !formData.name || !formData.category || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const updatedService = {
      ...selectedService,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration) || 30,
      category: formData.category,
      isActive: formData.isActive
    };

    setServices(prev => prev.map(service =>
      service.id === selectedService.id ? updatedService : service
    ));
    setIsEditDialogOpen(false);
    setSelectedService(null);
    resetForm();
    toast.success("Serviço atualizado com sucesso!");
  };

  const handleDeleteService = () => {
    if (selectedService) {
      setServices(prev => prev.filter(service => service.id !== selectedService.id));
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
      toast.success("Serviço removido com sucesso!");
    }
  };

  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      isActive: service.isActive
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleOpenFilters = () => {
    setIsFilterDialogOpen(true);
  };

  const handleApplyAdvancedFilters = (filters: {
    dateRange: { start: Date | null; end: Date | null };
    category: string;
    status: string;
    priceRange: string;
    duration: string;
  }) => {
    setAdvancedFilters({
      dateRange: filters.dateRange,
      priceRange: filters.priceRange,
      duration: filters.duration
    });

    // Aplicar também os filtros básicos se fornecidos
    if (filters.category) {
      setCategoryFilter(filters.category);
    }
    if (filters.status) {
      setStatusFilter(filters.status === "active" ? "active" : "inactive");
    }

    toast.success("Filtros aplicados com sucesso!");
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({
      dateRange: { start: null, end: null },
      priceRange: "",
      duration: ""
    });
  };

  const hasFilters = searchTerm !== "" ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    advancedFilters.dateRange.start !== null ||
    advancedFilters.dateRange.end !== null ||
    advancedFilters.priceRange !== "" ||
    advancedFilters.duration !== "";

  // Estatísticas dos serviços
  const totalServices = services.length;

  // Serviço mais realizado (simulado - seria baseado em dados reais de agendamentos)
  const mostRequestedService = services.length > 0
    ? services.reduce((prev, current) =>
      // Simulando popularidade baseada no ID (menor ID = mais antigo = mais popular)
      prev.id < current.id ? prev : current
    ).name
    : "N/A";

  // Preço médio dos serviços
  const averagePrice = services.length > 0
    ? services.reduce((sum, service) => sum + service.price, 0) / services.length
    : 0;

  // Serviços ativos vs inativos
  const activeServices = services.filter(service => service.isActive).length;
  const inactiveServices = services.filter(service => !service.isActive).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços da Clínica</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos pela clínica</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Serviços Oferecidos"
            value={totalServices}
            icon={Settings}
          />
          <StatsCard
            title="Serviço Mais Realizado"
            value={mostRequestedService}
            icon={TrendingUp}
          />
          <StatsCard
            title="Preço Médio dos Serviços"
            value={`R$ ${averagePrice.toFixed(2)}`}
            icon={DollarSign}
          />
          <StatsCard
            title="Serviços Ativos x Inativos"
            value={`${activeServices} / ${inactiveServices}`}
            icon={Activity}
          />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Filtros */}
          <ServiceFilters
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategoryFilter}
            onStatusChange={setStatusFilter}
            onAddNew={openAddDialog}
            onOpenFilters={handleOpenFilters}
            onClearAdvancedFilters={handleClearAdvancedFilters}
            filteredServicesCount={filteredServices.length}
            totalServicesCount={services.length}
            advancedFilters={advancedFilters}
          />

          {/* Lista de Serviços */}
          <ServiceList
            services={filteredServices}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
            onAddNew={openAddDialog}
            hasFilters={hasFilters}
          />
        </div>

        {/* Dialogs */}
        <ServiceFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          title="Adicionar Novo Serviço"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleAddService}
          onCancel={() => {
            setIsAddDialogOpen(false);
            resetForm();
          }}
          loading={loading}
          submitLabel="Salvar"
        />

        <ServiceFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Editar Serviço"
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleEditService}
          onCancel={() => {
            setIsEditDialogOpen(false);
            setSelectedService(null);
            resetForm();
          }}
          loading={loading}
          submitLabel="Salvar"
        />

        <DeleteServiceDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          service={selectedService}
          onConfirm={handleDeleteService}
        />

        <FilterDialog
          isOpen={isFilterDialogOpen}
          onClose={() => setIsFilterDialogOpen(false)}
          onApplyFilters={handleApplyAdvancedFilters}
        />
      </div>
    </AppLayout>
  );
};

export default Servicos;