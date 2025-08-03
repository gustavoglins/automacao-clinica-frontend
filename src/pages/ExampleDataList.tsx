import React, { useState } from 'react';
import { DataList } from '@/components/ui/data-list';
import { createFetchDataFromArray } from '@/lib/dataListUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Plus, Search } from 'lucide-react';

// Tipo de exemplo para demonstração
interface ExampleItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  author: string;
  priority: 'low' | 'medium' | 'high';
}

// Dados de exemplo
const exampleData: ExampleItem[] = [
  {
    id: '1',
    title: 'Consulta de Rotina',
    description: 'Verificação geral de saúde bucal',
    status: 'active',
    createdAt: '2024-01-15',
    author: 'Dr. Silva',
    priority: 'medium',
  },
  {
    id: '2',
    title: 'Limpeza Dental',
    description: 'Procedimento de limpeza e prevenção',
    status: 'active',
    createdAt: '2024-01-14',
    author: 'Dra. Santos',
    priority: 'low',
  },
  {
    id: '3',
    title: 'Tratamento de Canal',
    description: 'Procedimento endodôntico especializado',
    status: 'pending',
    createdAt: '2024-01-13',
    author: 'Dr. Costa',
    priority: 'high',
  },
  {
    id: '4',
    title: 'Ortodontia',
    description: 'Consulta para aparelho ortodôntico',
    status: 'active',
    createdAt: '2024-01-12',
    author: 'Dra. Lima',
    priority: 'medium',
  },
  {
    id: '5',
    title: 'Implante Dentário',
    description: 'Procedimento de implante',
    status: 'inactive',
    createdAt: '2024-01-11',
    author: 'Dr. Oliveira',
    priority: 'high',
  },
  // Adicionar mais itens para demonstrar paginação
  ...Array.from({ length: 15 }, (_, index) => ({
    id: `${index + 6}`,
    title: `Item de Exemplo ${index + 6}`,
    description: `Descrição do item ${index + 6}`,
    status: (['active', 'inactive', 'pending'] as const)[index % 3],
    createdAt: `2024-01-${10 - (index % 10)}`,
    author: `Autor ${index + 6}`,
    priority: (['low', 'medium', 'high'] as const)[index % 3],
  })),
];

const ExampleDataListPage = () => {
  const [selectedItem, setSelectedItem] = useState<ExampleItem | null>(null);

  // Função para criar os dados paginados
  const fetchData = createFetchDataFromArray(exampleData);

  // Função para renderizar cada item
  const renderItem = (item: ExampleItem) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <Badge className={statusColors[item.status]}>
                  {item.status}
                </Badge>
                <Badge className={priorityColors[item.priority]}>
                  {item.priority}
                </Badge>
              </div>

              <p className="text-muted-foreground mb-3">{item.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{item.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Editar
              </Button>
              <Button size="sm" variant="destructive">
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleItemSelect = (item: ExampleItem) => {
    setSelectedItem(item);
  };

  const handleAddNew = () => {};

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Exemplo de DataList Customizada
        </h1>
        <p className="text-muted-foreground">
          Demonstração completa de como usar o componente DataList com dados
          customizados
        </p>
      </div>

      {/* Exemplos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DataList com paginação */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Paginação por Botões</h2>
          <DataList
            title="Lista com Paginação"
            description="Navegação através de botões de página"
            fetchData={fetchData}
            renderItem={renderItem}
            pagination="paged"
            pageSize={4}
            height="600px"
            emptyStateIcon={
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            }
            emptyStateTitle="Nenhum item encontrado"
            emptyStateDescription="Não há itens para exibir no momento"
            emptyStateAction={
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            }
            onItemSelect={handleItemSelect}
          />
        </div>

        {/* DataList com scroll infinito */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Scroll Infinito</h2>
          <DataList
            title="Lista com Scroll Infinito"
            description="Carregamento automático ao rolar"
            fetchData={fetchData}
            renderItem={renderItem}
            pagination="infinite"
            pageSize={3}
            height="600px"
            onItemSelect={handleItemSelect}
          />
        </div>
      </div>

      {/* Lista compacta */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Versão Compacta</h2>
        <div className="max-w-4xl">
          <DataList
            title="Lista Compacta"
            description="Versão mais compacta para espaços menores"
            fetchData={fetchData}
            renderItem={renderItem}
            pagination="paged"
            pageSize={6}
            height="400px"
            className="shadow-lg"
          />
        </div>
      </div>

      {/* Informações sobre o item selecionado */}
      {selectedItem && (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Item Selecionado</h3>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {selectedItem.id}
              </p>
              <p>
                <strong>Título:</strong> {selectedItem.title}
              </p>
              <p>
                <strong>Descrição:</strong> {selectedItem.description}
              </p>
              <p>
                <strong>Status:</strong> {selectedItem.status}
              </p>
              <p>
                <strong>Autor:</strong> {selectedItem.author}
              </p>
              <p>
                <strong>Prioridade:</strong> {selectedItem.priority}
              </p>
              <p>
                <strong>Criado em:</strong>{' '}
                {new Date(selectedItem.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções de uso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">
            Como usar este exemplo
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>
              • <strong>Clique nos itens</strong> para ver os detalhes abaixo
            </p>
            <p>
              • <strong>Navegue pelas páginas</strong> usando os botões ou
              scroll infinito
            </p>
            <p>
              • <strong>Compare as diferentes configurações</strong> lado a lado
            </p>
            <p>
              • <strong>Observe a altura fixa</strong> independente do conteúdo
            </p>
            <p>
              • <strong>Veja o estado vazio</strong> quando não há dados
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExampleDataListPage;
