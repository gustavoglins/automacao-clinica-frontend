import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Stethoscope,
  Heart,
  Eye,
  Zap,
  Shield,
  Star,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

// Categorias de serviços odontológicos
const serviceCategories = [
  { value: "preventivo", label: "Preventivo", icon: Shield, color: "bg-green-100 text-green-800" },
  { value: "restaurador", label: "Restaurador", icon: Heart, color: "bg-blue-100 text-blue-800" },
  { value: "ortodontia", label: "Ortodontia", icon: Zap, color: "bg-purple-100 text-purple-800" },
  { value: "cirurgia", label: "Cirurgia", icon: Stethoscope, color: "bg-red-100 text-red-800" },
  { value: "estetico", label: "Estético", icon: Star, color: "bg-yellow-100 text-yellow-800" },
  { value: "emergencia", label: "Emergência", icon: Zap, color: "bg-orange-100 text-orange-800" }
];

const Servicos = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para o formulário
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    isActive: true
  });

  // Dados mockados de serviços
  const mockServices: Service[] = [
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

    setFilteredServices(filtered);
  }, [services, searchTerm, categoryFilter, statusFilter]);

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

  const getCategoryInfo = (category: string) => {
    return serviceCategories.find(cat => cat.value === category) || serviceCategories[0];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Serviços da Clínica</h1>
            <p className="text-gray-600 mt-1">Gerencie os serviços oferecidos pela clínica</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Serviço</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Consulta de Rotina"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duração (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o serviço..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Serviço ativo</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddService}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Buscar serviços</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category-filter">Categoria</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {serviceCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Serviços */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Serviços</CardTitle>
                <CardDescription>
                  {filteredServices.length} serviços encontrados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                    ? "Tente ajustar os filtros ou buscar por outros termos"
                    : "Comece adicionando o primeiro serviço da clínica"
                  }
                </p>
                {(!searchTerm && categoryFilter === "all" && statusFilter === "all") && (
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Serviço
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => {
                  const categoryInfo = getCategoryInfo(service.category);
                  const CategoryIcon = categoryInfo.icon;

                  return (
                    <Card key={service.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 leading-tight">
                                {service.name}
                              </h3>
                              <Badge
                                variant={service.isActive ? "default" : "secondary"}
                                className={`mt-1 ${service.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                              >
                                {service.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(service)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(service)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {service.description || "Sem descrição"}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>Preço:</span>
                            </div>
                            <span className="font-semibold text-green-600">
                              {formatPrice(service.price)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Duração:</span>
                            </div>
                            <span className="font-medium">
                              {formatDuration(service.duration)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Filter className="w-4 h-4" />
                              <span>Categoria:</span>
                            </div>
                            <Badge variant="outline" className={categoryInfo.color}>
                              {categoryInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Serviço</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome do Serviço *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Consulta de Rotina"
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Preço (R$) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-duration">Duração (min)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o serviço..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-isActive">Serviço ativo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedService(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditService}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o serviço "{selectedService?.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteService}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Servicos;
