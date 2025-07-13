import { useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SearchBar } from "./SearchBar";
import { PatientCard } from "./PatientCard";
import { Patient } from "@/types/patient";
import { searchPatients } from "@/services/patientService";

interface AllPatientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  onSchedule?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onViewRecord?: (patient: Patient) => void;
}

export const AllPatientsDialog = ({
  open,
  onOpenChange,
  patients,
  onSchedule,
  onEdit,
  onViewRecord
}: AllPatientsDialogProps) => {
  const [dialogSearch, setDialogSearch] = useState("");

  const filteredPatients = searchPatients(patients, dialogSearch);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full max-h-[95vh] m-0 top-4 translate-y-0 p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* Header fixo */}
          <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
            <DialogHeader>
              <DialogTitle>Todos os Pacientes</DialogTitle>
              <DialogDescription>Veja todos os pacientes cadastrados</DialogDescription>
            </DialogHeader>
          </div>

          {/* Barra de pesquisa fixa */}
          <div className="flex-shrink-0 p-6 py-4 border-b bg-muted/10">
            <SearchBar
              value={dialogSearch}
              onChange={setDialogSearch}
              placeholder="Buscar por nome, telefone, email, plano ou status..."
              autoFocus
              resultsCount={filteredPatients.length}
            />
          </div>

          {/* Conteúdo rolável centralizado */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <div className="max-w-4xl mx-auto space-y-3">
                {filteredPatients.length === 0 && dialogSearch.trim().length >= 2 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-2">
                      <Search className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    </div>
                    <p>Nenhum paciente encontrado para "{dialogSearch}"</p>
                    <p className="text-sm mt-1">Tente buscar por nome, email, telefone, plano ou status</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="mb-2">
                      <Search className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    </div>
                    <p>Nenhum paciente encontrado</p>
                  </div>
                ) : (
                  <>
                    {filteredPatients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        onViewRecord={onViewRecord}
                      />
                    ))}
                    {/* Padding no final para garantir scroll */}
                    <div className="h-8"></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
