/**
 * Webhook Service
 *
 * Serviço centralizado para envio de notificações via webhook
 * para operações de INSERT, UPDATE e DELETE nas entidades do sistema.
 */

export enum WebhookOperation {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum WebhookEntity {
  CLINIC_ADDRESS = 'clinic-address',
  CLINIC_HOURS = 'clinic-hours',
  CLINIC_CLOSURES = 'closures',
  SERVICES = 'services',
  EMPLOYEES = 'employees',
  CONVENIOS = 'convenios',
}

interface WebhookConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

class WebhookService {
  private config: WebhookConfig;

  constructor(config?: Partial<WebhookConfig>) {
    this.config = {
      // baseUrl: 'http://localhost:5678/webhook-test',
      baseUrl: 'http://localhost:5678/webhook',
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Mapeia a entidade para o endpoint correto
   */
  private getEndpoint(entity: WebhookEntity): string {
    const endpoints = {
      [WebhookEntity.CLINIC_ADDRESS]: 'listener-clinic-address',
      [WebhookEntity.CLINIC_HOURS]: 'listener-clinic-hours',
      [WebhookEntity.CLINIC_CLOSURES]: 'listener-clinic-closures',
      [WebhookEntity.SERVICES]: 'listener-services',
      [WebhookEntity.EMPLOYEES]: 'listener-employees',
      [WebhookEntity.CONVENIOS]: 'listener-insurance',
    };

    return `${this.config.baseUrl}/${endpoints[entity]}`;
  }

  /**
   * Envia uma notificação de webhook
   */
  async notify(
    entity: WebhookEntity,
    operation: WebhookOperation
  ): Promise<void> {
    const url = this.getEndpoint(entity);

    console.log(
      `🔔 [Webhook] Enviando notificação: ${operation} para ${entity} -> ${url}`
    );

    try {
      await this.sendWithRetry(url);
      console.log(
        `✅ [Webhook] Notificação enviada com sucesso: ${operation} ${entity}`
      );
    } catch (error) {
      console.error(
        `❌ [Webhook] Falha ao enviar notificação: ${operation} ${entity}`,
        error
      );
      // Não lançamos o erro para não interromper a operação principal
    }
  }

  /**
   * Envia a requisição com retry
   */
  private async sendWithRetry(url: string, attempt = 1): Promise<void> {
    console.log(
      `🌐 [Webhook] Tentativa ${attempt} - Enviando POST para: ${url}`
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      console.log(
        `📡 [Webhook] Resposta recebida - Status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(
        `✅ [Webhook] Requisição bem-sucedida na tentativa ${attempt}`
      );
    } catch (error) {
      console.error(`❌ [Webhook] Erro na tentativa ${attempt}:`, error);

      if (attempt < this.config.retryAttempts) {
        console.warn(
          `🔄 [Webhook] Tentativa ${attempt} falhou, tentando novamente em ${this.config.retryDelay}ms...`
        );
        await this.delay(this.config.retryDelay);
        return this.sendWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Utilitário para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Métodos de conveniência para cada entidade
   */
  async notifyClinicAddress(operation: WebhookOperation): Promise<void> {
    return this.notify(WebhookEntity.CLINIC_ADDRESS, operation);
  }

  async notifyClinicHours(operation: WebhookOperation): Promise<void> {
    return this.notify(WebhookEntity.CLINIC_HOURS, operation);
  }

  async notifyClosures(operation: WebhookOperation): Promise<void> {
    return this.notify(WebhookEntity.CLINIC_CLOSURES, operation);
  }

  async notifyServices(operation: WebhookOperation): Promise<void> {
    return this.notify(WebhookEntity.SERVICES, operation);
  }

  async notifyEmployees(operation: WebhookOperation): Promise<void> {
    return this.notify(WebhookEntity.EMPLOYEES, operation);
  }

  async notifyConvenios(operation: WebhookOperation): Promise<void> {
    return this.notify(WebhookEntity.CONVENIOS, operation);
  }
}

// Instância singleton
export const webhookService = new WebhookService();
