import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { PatientCard } from "./PatientCard";
import { Patient } from "@/types/patient";
import { UserRound } from "lucide-react";

interface PatientListProps {
  patients: Patient[];
  onSchedule?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onViewRecord?: (patient: Patient) => void;
  onViewAll?: () => void;
  patientsPerPage?: number;
}

export const PatientList = ({
  patients,
  onSchedule,
  onEdit,
  onViewRecord,
  onViewAll,
  patientsPerPage = 5
}: PatientListProps) => {
  const [patientsPage, setPatientsPage] = useState(0);

  useEffect(() => {
    setPatientsPage(0);
  }, [patients.length]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(patients.length / patientsPerPage) - 1);
    if (patientsPage > maxPage) {
      setPatientsPage(maxPage);
    }
  }, [patientsPage, patients.length, patientsPerPage]);

  const startIdx = patientsPage * patientsPerPage;
  const endIdx = Math.min(startIdx + patientsPerPage, patients.length);
  const paginatedPatients = patients.slice(startIdx, endIdx);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Lista de Pacientes</CardTitle>
        <CardDescription>
          Visualize e gerencie todos os pacientes da clínica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <UserRound className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum paciente encontrado</h3>
            <p className="text-gray-600">
              Nenhum paciente foi cadastrado ainda.
            </p>
          </div>
        ) : (
          <>
            <div className="h-[600px] space-y-4 flex flex-col">
              {paginatedPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onViewRecord={onViewRecord}
                />
              ))}
              {Array.from({ length: patientsPerPage - paginatedPatients.length }).map((_, idx) => (
                <div key={"placeholder-patient-" + idx} className="flex items-center justify-between p-4 rounded-lg flex-shrink-0 opacity-0 pointer-events-none">
                  <div className="flex items-center gap-4">
                    {/* Placeholder content */}
                  </div>
                </div>
              ))}
            </div>

            {patients.length > patientsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Anterior"
                  onClick={() => setPatientsPage((p) => Math.max(0, p - 1))}
                  disabled={patientsPage === 0}
                >
                  <span className="sr-only">Anterior</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                  </svg>
                </Button>
                <span className="text-xs text-muted-foreground italic">
                  Mostrando {patientsPage * patientsPerPage + 1}
                  -{Math.min((patientsPage + 1) * patientsPerPage, patients.length)} de {patients.length} pacientes
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Próxima"
                  onClick={() => setPatientsPage((p) =>
                    (p + 1) < Math.ceil(patients.length / patientsPerPage) ? p + 1 : p
                  )}
                  disabled={(patientsPage + 1) * patientsPerPage >= patients.length}
                >
                  <span className="sr-only">Próxima</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </Button>
              </div>
            )}

            <div className="mt-4">
              <Button
                size="sm"
                className="w-full mt-auto"
                variant="outline-primary"
                onClick={onViewAll}
              >
                Ver Todos
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
