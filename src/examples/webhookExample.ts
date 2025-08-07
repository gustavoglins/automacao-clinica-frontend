/**
 * Arquivo de exemplo para testar o sistema de webhooks
 * 
 * Este arquivo demonstra como o sistema de webhooks está integrado
 * com os serviços da aplicação.
 */

import { webhookService, WebhookOperation, WebhookEntity } from '../services/webhookService';

/**
 * Função de exemplo para testar as notificações de webhook
 */
export async function testWebhookNotifications() {
  console.log('🔔 Testando notificações de webhook...');

  try {
    // Teste de notificação para funcionários
    console.log('📝 Testando notificação INSERT para funcionários...');
    await webhookService.notifyEmployees(WebhookOperation.INSERT);

    // Teste de notificação para serviços
    console.log('📝 Testando notificação UPDATE para serviços...');
    await webhookService.notifyServices(WebhookOperation.UPDATE);

    // Teste de notificação para fechamentos
    console.log('📝 Testando notificação DELETE para fechamentos...');
    await webhookService.notifyClosures(WebhookOperation.DELETE);

    // Teste de notificação para endereços da clínica
    console.log('📝 Testando notificação UPDATE para endereços...');
    await webhookService.notifyClinicAddress(WebhookOperation.UPDATE);

    // Teste de notificação para horários da clínica
    console.log('📝 Testando notificação UPDATE para horários...');
    await webhookService.notifyClinicHours(WebhookOperation.UPDATE);

    console.log('✅ Todos os testes de webhook foram executados!');
  } catch (error) {
    console.error('❌ Erro ao testar webhooks:', error);
  }
}

/**
 * Demonstração de como as notificações são chamadas automaticamente
 * nos serviços após operações de CRUD
 */
export function webhookIntegrationExample() {
  console.log(`
🔗 INTEGRAÇÃO DE WEBHOOKS IMPLEMENTADA

Os seguintes endpoints serão notificados automaticamente:

📍 ENDEREÇOS DA CLÍNICA: http://localhost:5678/webhook-test/listener-clinic-address
   - Notificado em: CREATE, UPDATE de endereços

⏰ HORÁRIOS DA CLÍNICA: http://localhost:5678/webhook-test/listener-clinic-hours  
   - Notificado em: UPDATE de horários de funcionamento

🚫 FECHAMENTOS: http://localhost:5678/webhook-test/listener-clinic-closures
   - Notificado em: CREATE, UPDATE, DELETE de fechamentos

💼 SERVIÇOS: http://localhost:5678/webhook-test/listener-services
   - Notificado em: CREATE, UPDATE, DELETE de serviços

👥 FUNCIONÁRIOS: http://localhost:5678/webhook-test/listener-employees
   - Notificado em: CREATE, UPDATE, DELETE de funcionários

📋 OPERAÇÕES MONITORADAS:
   - INSERT: Quando um novo registro é criado
   - UPDATE: Quando um registro existente é modificado  
   - DELETE: Quando um registro é removido

🔧 CARACTERÍSTICAS:
   - Notificações assíncronas (não bloqueiam operações principais)
   - Sistema de retry automático (3 tentativas)
   - Timeout configurável (5 segundos)
   - Logs detalhados para debugging
   - Requisições POST sem conteúdo no body

📝 EXEMPLO DE USO NOS SERVIÇOS:
   
   // No employeeService.ts - após criar funcionário
   await webhookService.notifyEmployees(WebhookOperation.INSERT);
   
   // No servicesService.ts - após atualizar serviço  
   await webhookService.notifyServices(WebhookOperation.UPDATE);
   
   // No closureService.ts - após deletar fechamento
   await webhookService.notifyClosures(WebhookOperation.DELETE);
  `);
}

// Para executar os testes, descomente a linha abaixo:
// testWebhookNotifications();
