import React, { useState, useEffect } from "react";
import {
  applyPhoneMask,
  onlyNumbers,
  applyCpfMask,
  getPhoneInfo,
  isValidCpf,
} from "@/lib/utils";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, UserPlus } from "lucide-react";
import { Patient, UpdatePatientData } from "@/types/patient";

interface EditPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onEditPatient: (patient: UpdatePatientData) => void;
}

interface PatientFormData {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
}

const EditPatientDialog: React.FC<EditPatientDialogProps> = ({
  open,
  onOpenChange,
  patient,
  onEditPatient,
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: "",
    cpf: "",
    birthDate: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; cpf?: string }>({});

  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.fullName || "",
        cpf: patient.cpf || "",
        birthDate: patient.birthDate || "",
        phone: patient.phone || "",
        email: patient.email || "",
      });
    }
  }, [patient, open]);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    if (field === "phone") {
      setFormData((prev) => ({
        ...prev,
        [field]: applyPhoneMask(value),
      }));
    } else if (field === "cpf") {
      const onlyNums = onlyNumbers(value).slice(0, 11);
      setFormData((prev) => ({
        ...prev,
        cpf: applyCpfMask(onlyNums),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localErrors: { phone?: string; cpf?: string } = {};
    const phoneInfo = getPhoneInfo(formData.phone);
    if (!phoneInfo.isValid) {
      localErrors.phone = phoneInfo.message;
    }
    if (formData.cpf && !isValidCpf(formData.cpf)) {
      localErrors.cpf = "CPF inválido";
    }
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      if (!patient) return;
      const updatedPatient: UpdatePatientData = {
        id: patient.id,
        fullName: formData.fullName,
        cpf: onlyNumbers(formData.cpf),
        birthDate: formData.birthDate,
        phone: onlyNumbers(formData.phone),
        email: formData.email,
      };
      onEditPatient(updatedPatient);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao editar paciente:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-5 h-5 text-primary" />
            Editar Paciente
          </DialogTitle>
          <DialogDescription>
            Altere as informações do paciente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-primary" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    placeholder="Digite o nome completo"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    required
                  />
                  {errors.cpf && (
                    <span className="text-red-500 text-xs">{errors.cpf}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5 text-primary" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-xs">{errors.phone}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientDialog;
