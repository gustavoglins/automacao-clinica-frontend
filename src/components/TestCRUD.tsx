import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { testConnection } from '@/lib/supabaseClient';
import { patientService } from '@/services/patientService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/servicesService';
import { appointmentService } from '@/services/appointmentService';
import { Patient, CreatePatientData } from '@/types/patient';
import { Employee, CreateEmployeeData } from '@/types/employee';
import { Service, CreateServiceData } from '@/types/service';
import { Appointment, CreateAppointmentData } from '@/types/appointment';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: unknown;
}

export const TestCRUD: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (name: string, status: 'pending' | 'success' | 'error', message: string, data?: unknown) => {
    setTestResults(prev => [...prev, { name, status, message, data }]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Teste 1: Conexão com Supabase
    addTestResult('Conexão Supabase', 'pending', 'Testando conexão...');
    try {
      const connectionOk = await testConnection();
      if (connectionOk) {
        addTestResult('Conexão Supabase', 'success', 'Conexão estabelecida com sucesso!');
      } else {
        addTestResult('Conexão Supabase', 'error', 'Falha na conexão com Supabase');
        return;
      }
    } catch (error) {
      addTestResult('Conexão Supabase', 'error', `Erro: ${error}`);
      return;
    }

    // Teste 2: CRUD de Pacientes
    addTestResult('CRUD Pacientes', 'pending', 'Testando operações de pacientes...');
    try {
      // Create
      const newPatient: CreatePatientData = {
        fullName: 'João Silva Teste',
        cpf: '12345678901',
        birthDate: '1990-01-01',
        phone: '11999999999',
        email: 'joao.teste@email.com',
        address: 'Rua Teste, 123'
      };

      const createdPatient = await patientService.createPatient(newPatient);
      addTestResult('CRUD Pacientes - Create', 'success', 'Paciente criado com sucesso', createdPatient);

      // Read
      const readPatient = await patientService.getPatientById(createdPatient.id);
      if (readPatient) {
        addTestResult('CRUD Pacientes - Read', 'success', 'Paciente lido com sucesso', readPatient);
      } else {
        addTestResult('CRUD Pacientes - Read', 'error', 'Falha ao ler paciente');
      }

      // Update
      const updatedPatient = await patientService.updatePatient({
        id: createdPatient.id,
        fullName: 'João Silva Atualizado'
      });
      addTestResult('CRUD Pacientes - Update', 'success', 'Paciente atualizado com sucesso', updatedPatient);

      // Delete
      await patientService.deletePatient(createdPatient.id);
      addTestResult('CRUD Pacientes - Delete', 'success', 'Paciente deletado com sucesso');

      addTestResult('CRUD Pacientes', 'success', 'Todas as operações de pacientes funcionando!');
    } catch (error) {
      addTestResult('CRUD Pacientes', 'error', `Erro: ${error}`);
    }

    // Teste 3: CRUD de Funcionários
    addTestResult('CRUD Funcionários', 'pending', 'Testando operações de funcionários...');
    try {
      // Create
      const newEmployee: CreateEmployeeData = {
        fullName: 'Maria Santos Teste',
        cpf: '98765432100',
        role: 'Dentista',
        status: 'ativo',
        specialty: 'Ortodontia',
        phone: '11888888888',
        email: 'maria.teste@email.com',
        hiredAt: '2023-01-01'
      };

      const createdEmployee = await employeeService.createEmployee(newEmployee);
      addTestResult('CRUD Funcionários - Create', 'success', 'Funcionário criado com sucesso', createdEmployee);

      // Read
      const readEmployee = await employeeService.getEmployeeById(createdEmployee.id);
      if (readEmployee) {
        addTestResult('CRUD Funcionários - Read', 'success', 'Funcionário lido com sucesso', readEmployee);
      } else {
        addTestResult('CRUD Funcionários - Read', 'error', 'Falha ao ler funcionário');
      }

      // Update
      const updatedEmployee = await employeeService.updateEmployee({
        id: createdEmployee.id,
        fullName: 'Maria Santos Atualizada'
      });
      addTestResult('CRUD Funcionários - Update', 'success', 'Funcionário atualizado com sucesso', updatedEmployee);

      // Delete
      await employeeService.deleteEmployee(createdEmployee.id);
      addTestResult('CRUD Funcionários - Delete', 'success', 'Funcionário deletado com sucesso');

      addTestResult('CRUD Funcionários', 'success', 'Todas as operações de funcionários funcionando!');
    } catch (error) {
      addTestResult('CRUD Funcionários', 'error', `Erro: ${error}`);
    }

    // Teste 4: CRUD de Serviços
    addTestResult('CRUD Serviços', 'pending', 'Testando operações de serviços...');
    try {
      // Create
      const newService: CreateServiceData = {
        name: 'Consulta Teste',
        category: 'clinico_geral',
        description: 'Serviço de teste',
        durationMinutes: 30,
        price: 100.00,
        active: true
      };

      const createdService = await serviceService.createService(newService);
      addTestResult('CRUD Serviços - Create', 'success', 'Serviço criado com sucesso', createdService);

      // Read
      const readService = await serviceService.getServiceById(createdService.id);
      if (readService) {
        addTestResult('CRUD Serviços - Read', 'success', 'Serviço lido com sucesso', readService);
      } else {
        addTestResult('CRUD Serviços - Read', 'error', 'Falha ao ler serviço');
      }

      // Update
      const updatedService = await serviceService.updateService({
        id: createdService.id,
        name: 'Consulta Atualizada'
      });
      addTestResult('CRUD Serviços - Update', 'success', 'Serviço atualizado com sucesso', updatedService);

      // Delete
      console.log('🧪 Testando delete do serviço com ID:', createdService.id);
      await serviceService.deleteService(createdService.id);
      addTestResult('CRUD Serviços - Delete', 'success', 'Serviço deletado com sucesso');

      addTestResult('CRUD Serviços', 'success', 'Todas as operações de serviços funcionando!');
    } catch (error) {
      addTestResult('CRUD Serviços', 'error', `Erro: ${error}`);
    }

    setIsRunning(false);
    toast.success('Testes concluídos! Verifique os resultados abaixo.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de Operações CRUD</CardTitle>
          <CardDescription>
            Teste todas as operações CRUD do sistema para verificar se estão funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Executando testes...' : 'Executar Todos os Testes'}
          </Button>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{result.name}</h4>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'success' && '✅ Sucesso'}
                      {result.status === 'error' && '❌ Erro'}
                      {result.status === 'pending' && '⏳ Pendente'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600">Ver dados</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                  {index < testResults.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 