import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { UserPlus } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Novo Paciente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo paciente
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nome */}
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Digite o nome completo do paciente"
            />
          </div>

          {/* Idade e Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                placeholder="Ex: 25"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Plano de Saúde */}
          <div className="grid gap-2">
            <Label htmlFor="plan">Plano de Saúde</Label>
            <Select
              value={formData.plan}
              onValueChange={(value) => handleInputChange("plan", value)}
            >
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

          {/* Endereço */}
          <div className="grid gap-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          {/* Observações */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Informações adicionais sobre o paciente..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.phone}
          >
            {loading ? "Salvando..." : "Salvar Paciente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;
