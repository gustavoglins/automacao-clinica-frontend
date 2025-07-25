import { PaginatedData } from "@/types/dataList";
import { Patient } from "@/types/patient";
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";

/**
 * Converte uma lista simples para o formato PaginatedData para uso com DataList
 */
export function createPaginatedDataFromArray<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedData<T> {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    data: paginatedItems,
    totalCount,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

/**
 * Cria uma função fetchData para pacientes compatível com DataList
 */
export function createPatientsFetchData(patients: Patient[]) {
  return async (page: number, pageSize: number): Promise<PaginatedData<Patient>> => {
    // Simula um delay de API
    await new Promise(resolve => setTimeout(resolve, 100));
    return createPaginatedDataFromArray(patients, page, pageSize);
  };
}

/**
 * Cria uma função fetchData para funcionários compatível com DataList
 */
export function createEmployeesFetchData(employees: Employee[]) {
  return async (page: number, pageSize: number): Promise<PaginatedData<Employee>> => {
    // Simula um delay de API
    await new Promise(resolve => setTimeout(resolve, 100));
    return createPaginatedDataFromArray(employees, page, pageSize);
  };
}

/**
 * Cria uma função fetchData para serviços compatível com DataList
 */
export function createServicesFetchData(services: Service[]) {
  return async (page: number, pageSize: number): Promise<PaginatedData<Service>> => {
    // Simula um delay de API
    await new Promise(resolve => setTimeout(resolve, 100));
    return createPaginatedDataFromArray(services, page, pageSize);
  };
}

/**
 * Função genérica para criar fetchData de qualquer array
 */
export function createFetchDataFromArray<T>(items: T[]) {
  return async (page: number, pageSize: number): Promise<PaginatedData<T>> => {
    // Simula um delay de API
    await new Promise(resolve => setTimeout(resolve, 100));
    return createPaginatedDataFromArray(items, page, pageSize);
  };
}
