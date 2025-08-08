import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Plus,
  Edit,
  Navigation,
  Building,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { clinicAddressService } from '@/services/clinicAddressService';
import { AddEditAddressDialog } from './AddEditAddressDialog';
import type { ClinicAddress } from '@/types/clinicAddress';

export const ClinicAddressSettings: React.FC = () => {
  const [addresses, setAddresses] = useState<ClinicAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ClinicAddress | null>(
    null
  );

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await clinicAddressService.getAllAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços da clínica');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleEdit = (address: ClinicAddress) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleDialogSuccess = async () => {
    await loadAddresses();
  };

  const formatAddress = (address: ClinicAddress) => {
    const parts = [
      address.logradouro,
      address.numero,
      address.complemento,
    ].filter(Boolean);

    return parts.join(', ');
  };

  const formatLocation = (address: ClinicAddress) => {
    return `${address.bairro}, ${address.cidade} - ${address.estado}, ${address.cep}`;
  };

  const openInMaps = (address: ClinicAddress) => {
    const query = encodeURIComponent(
      `${formatAddress(address)}, ${formatLocation(address)}`
    );
    const url = `https://www.google.com/maps/search/${query}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço da Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando endereços...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço da Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <Button onClick={handleAddNew} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Endereço
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {formatAddress(address)}
                        </h4>
                      </div>

                      <p className="text-sm text-gray-600 mb-1">
                        {formatLocation(address)}
                      </p>

                      {address.pontoReferencia && (
                        <p className="text-sm text-gray-500 italic">
                          {address.pontoReferencia}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInMaps(address)}
                        title="Abrir no Google Maps"
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        title="Editar endereço"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddEditAddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editingAddress}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
};
