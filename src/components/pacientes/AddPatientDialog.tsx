import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, X, Check } from "lucide-react";
import { Patient } from "@/types/patient";

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPatient: (patient: Omit<Patient, "id">) => void;
}

interface PatientFormData {
  name: string;
  age: string;
  phone: string;
  email: string;
  plan: string;
  address: string;
  notes: string;
}

const healthPlans = [
  { value: "particular", label: "Particular" },
  { value: "unimed", label: "Unimed" },
  { value: "amil", label: "Amil" },
  { value: "bradesco", label: "Bradesco" },
  { value: "sulamerica", label: "SulAmérica" },
  { value: "hapvida", label: "Hapvida" },
  { value: "outros", label: "Outros" }
];

const AddPatientDialog: React.FC<AddPatientDialogProps> = ({
  open,
  onOpenChange,
  onAddPatient
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    age: "",
    phone: "",
    email: "",
    plan: "",
    address: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      phone: "",
      email: "",
      plan: "",
      address: "",
      notes: ""
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      return;
    }

    setLoading(true);

    try {
      const newPatient: Omit<Patient, "id"> = {
        name: formData.name,
        age: parseInt(formData.age) || 0,
        phone: formData.phone,
        email: formData.email,
        lastVisit: null,
        nextVisit: null,
        status: "ativo",
        plan: formData.plan || "Particular"
      };

      onAddPatient(newPatient);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-5 h-5 text-primary" />
            Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para cadastrar um novo paciente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Informações Pessoais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Ex: 25"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Informações do Plano */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Plano de Saúde</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plano de Saúde</Label>
                <Select value={formData.plan} onValueChange={(value) => handleInputChange("plan", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano de saúde" />
                  </SelectTrigger>
                  <SelectContent>
                    {healthPlans.map((plan) => (
                      <SelectItem key={plan.value} value={plan.label}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Rua, número, bairro, cidade"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Observações</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações Adicionais</Label>
              <Textarea
                id="notes"
                placeholder="Informações adicionais sobre o paciente..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.phone}
              className="min-w-[120px] flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Salvar Paciente
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;
