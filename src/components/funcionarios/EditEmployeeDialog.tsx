import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeService, type Employee } from "@/services/employeeService";
import { toast } from "sonner";
import { applyPhoneMask, onlyNumbers, isValidPhone, formatPhone, getPhoneInfo } from "@/lib/utils";
import { RequiredFieldsNote } from "@/components/ui/required-fields-note";

interface EditEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
}

export const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  employee,
  isOpen,
  onClose,
  onEmployeeUpdated
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    role: "",
    specialty: "",
    registrationNumber: "",
    hireDate: "",
    salary: "",
    status: "ativo",
    visibleOnSchedule: true,
    acceptsOnlineBooking: true,
    showContact: false,
    avatarUrl: "",
    notes: "",
    workDays: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    startHour: "08:00",
    endHour: "18:00"
  });
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: formatPhone(employee.phone || ""), // Formatar telefone na exibição
        cpf: employee.cpf || "",
        role: employee.role || "",
        specialty: employee.specialty || "",
        registrationNumber: employee.registrationNumber || "",
        hireDate: employee.hireDate || "",
        salary: employee.salary?.toString() || "",
        status: employee.status || "ativo",
        visibleOnSchedule: employee.visibleOnSchedule ?? true,
        acceptsOnlineBooking: employee.acceptsOnlineBooking ?? true,
        showContact: employee.showContact ?? false,
        avatarUrl: employee.avatarUrl || "",
        notes: employee.notes || "",
        workDays: employee.workDays || ["Seg", "Ter", "Qua", "Qui", "Sex"],
        startHour: employee.startHour || "08:00",
        endHour: employee.endHour || "18:00"
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    // Validar telefone com mensagem específica
    const phoneInfo = getPhoneInfo(formData.phone);
    if (!phoneInfo.isValid) {
      toast.error(phoneInfo.message);
      return;
    }

    setIsLoading(true);
    try {
      // Convert salary to number and prepare data
      const employeeData = {
        ...formData,
        id: employee.id,
        phone: onlyNumbers(formData.phone), // Salvar apenas os números
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        cpf: formData.cpf || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        notes: formData.notes || undefined,
      };

      // Validate form data
      const validation = employeeService.validateEmployeeData(employeeData);
      if (!validation.isValid) {
        toast.error(validation.errors[0]);
        return;
      }

      await employeeService.updateEmployeeWithSchedule(employeeData);
      onEmployeeUpdated();
      onClose();
    } catch (error) {
      // Error handling is already done in the service
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === "phone") {
      // Aplicar máscara de telefone
      const maskedValue = applyPhoneMask(value);
      setFormData(prev => ({ ...prev, [field]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
          <RequiredFieldsNote />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo <span className="text-primary">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Cargo <span className="text-primary">*</span></Label>
              <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dentista">Dentista</SelectItem>
                  <SelectItem value="Assistente">Assistente</SelectItem>
                  <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Auxiliar">Auxiliar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Select
                value={formData.specialty || undefined}
                onValueChange={(value) => handleChange("specialty", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                  <SelectItem value="Endodontia">Endodontia</SelectItem>
                  <SelectItem value="Periodontia">Periodontia</SelectItem>
                  <SelectItem value="Implantodontia">Implantodontia</SelectItem>
                  <SelectItem value="Cirurgia Oral">Cirurgia Oral</SelectItem>
                  <SelectItem value="Clínica Geral">Clínica Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Data de Contratação <span className="text-primary">*</span></Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleChange("hireDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone <span className="text-primary">*</span></Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-primary">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Número de Registro</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => handleChange("registrationNumber", e.target.value)}
                placeholder="CRO, COREM, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Salário</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Observações sobre o funcionário"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
