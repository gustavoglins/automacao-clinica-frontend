import { Patient } from "@/types/patient";

// Função para normalizar texto removendo acentos e caracteres especiais
export const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim();
};

// Função de busca inteligente
export const searchPatients = (patients: Patient[], searchTerm: string) => {
  if (!searchTerm.trim()) return patients;

  const normalizedSearch = normalizeText(searchTerm);

  return patients.filter(patient => {
    // Campos pesquisáveis normalizados
    const searchableFields = [
      normalizeText(patient.name),
      normalizeText(patient.email),
      normalizeText(patient.plan),
      normalizeText(patient.status),
      patient.phone.replace(/\D/g, ""), // Apenas números
    ];

    // Verifica se o termo está presente em qualquer campo
    return searchableFields.some(field => field.includes(normalizedSearch));
  });
};

// Função para filtrar pacientes por status
export const filterPatientsByStatus = (patients: Patient[], status: string) => {
  if (!status) return patients;
  return patients.filter(patient => patient.status === status);
};
