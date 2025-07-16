import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { employeeService, type Employee } from "@/services/employeeService";
import { toast } from "sonner";
import { applyPhoneMask, onlyNumbers, isValidPhone, formatPhone, getPhoneInfo } from "@/lib/utils";
import { RequiredFieldsNote } from "@/components/ui/required-fields-note";
import { UserPen, User, Phone, Briefcase, CreditCard, FileText, Check, X, Clock } from "lucide-react";

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
    workDays: ["Seg", "Ter", "Qua", "Qui", "Sex"] as string[],
    startHour: "08:00",
    endHour: "18:00"
  });

  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        phone: formatPhone(employee.phone || ""),
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

    const phoneInfo = getPhoneInfo(formData.phone);
    if (!phoneInfo.isValid) {
      toast.error(phoneInfo.message);
      return;
    }

    setIsLoading(true);
    try {
      const updatedEmployee: Employee = {
        ...employee,
        name: formData.name,
        email: formData.email,
        phone: onlyNumbers(formData.phone),
        cpf: formData.cpf,
        role: formData.role,
        specialty: formData.specialty,
        registrationNumber: formData.registrationNumber,
        hireDate: formData.hireDate,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        status: formData.status as 'ativo' | 'inativo',
        visibleOnSchedule: formData.visibleOnSchedule,
        acceptsOnlineBooking: formData.acceptsOnlineBooking,
        showContact: formData.showContact,
        avatarUrl: formData.avatarUrl,
        notes: formData.notes,
        workDays: formData.workDays,
        startHour: formData.startHour,
        endHour: formData.endHour
      };

      await employeeService.updateEmployee(updatedEmployee);
      toast.success("Funcionário atualizado com sucesso!");
      onEmployeeUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error("Erro ao atualizar funcionário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean | string[]) => {
    if (field === "phone") {
      const maskedValue = applyPhoneMask(value as string);
      setFormData(prev => ({ ...prev, [field]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPen className="w-5 h-5" />
            Editar Funcionário
          </DialogTitle>
          <DialogDescription>
            Edite as informações do funcionário
          </DialogDescription>
          <RequiredFieldsNote />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="exemplo@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select
                    value={formData.specialty || undefined}
                    onValueChange={(value) => handleChange("specialty", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ortodontia">Ortodontia</SelectItem>
                      <SelectItem value="Endodontia">Endodontia</SelectItem>
                      <SelectItem value="Periodontia">Periodontia</SelectItem>
                      <SelectItem value="Implantodontia">Implantodontia</SelectItem>
                      <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                      <SelectItem value="Estética">Estética</SelectItem>
                      <SelectItem value="Pediatria">Pediatria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Número de Registro</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange("registrationNumber", e.target.value)}
                    placeholder="CRO 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salário (R$)</Label>
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
                  <Label htmlFor="hireDate">Data de Contratação</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleChange("hireDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horário de Trabalho */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Horário de Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startHour">Horário de Início</Label>
                  <Input
                    id="startHour"
                    type="time"
                    value={formData.startHour}
                    onChange={(e) => handleChange("startHour", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endHour">Horário de Fim</Label>
                  <Input
                    id="endHour"
                    type="time"
                    value={formData.endHour}
                    onChange={(e) => handleChange("endHour", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visibleOnSchedule"
                    checked={formData.visibleOnSchedule}
                    onCheckedChange={(checked) => handleChange("visibleOnSchedule", checked)}
                  />
                  <Label htmlFor="visibleOnSchedule">Visível no agendamento</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="acceptsOnlineBooking"
                    checked={formData.acceptsOnlineBooking}
                    onCheckedChange={(checked) => handleChange("acceptsOnlineBooking", checked)}
                  />
                  <Label htmlFor="acceptsOnlineBooking">Aceita agendamento online</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showContact"
                    checked={formData.showContact}
                    onCheckedChange={(checked) => handleChange("showContact", checked)}
                  />
                  <Label htmlFor="showContact">Exibir contato publicamente</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Adicionais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Informações adicionais sobre o funcionário..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.role}
              className="min-w-[120px] flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
