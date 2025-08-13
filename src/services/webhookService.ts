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
      // baseUrl: 'https://n8n.nrddomain.shop/webhook-test',
      baseUrl: 'https://n8n.nrddomain.shop/webhook',
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
    operation: WebhookOperation,
    resourceId?: string | number
  ): Promise<void> {
    let url = this.getEndpoint(entity);
    if (operation === WebhookOperation.DELETE && resourceId !== undefined) {
      // Acrescenta o ID como query param para facilitar consumo
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}id=${encodeURIComponent(resourceId)}`;
    }

    console.log(
      `🔔 [Webhook] Enviando notificação: ${operation} para ${entity} -> ${url}`
    );

    try {
      const method = operation === WebhookOperation.DELETE ? 'DELETE' : 'POST';
      const body =
        operation === WebhookOperation.DELETE && resourceId !== undefined
          ? JSON.stringify({ id: resourceId })
          : undefined;
      await this.sendWithRetry(url, method, body);
      console.log(
        `✅ [Webhook] Notificação enviada com sucesso: ${operation} ${entity}${
          resourceId !== undefined ? ' id=' + resourceId : ''
        }`
      );
    } catch (error) {
      console.error(
        `❌ [Webhook] Falha ao enviar notificação: ${operation} ${entity}${
          resourceId !== undefined ? ' id=' + resourceId : ''
        }`,
        error
      );
      // Não lançamos o erro para não interromper a operação principal
    }
  }

  /**
   * Envia a requisição com retry
   */
  private async sendWithRetry(
    url: string,
    method: 'POST' | 'DELETE',
    body?: string,
    attempt = 1
  ): Promise<void> {
    console.log(
      `🌐 [Webhook] Tentativa ${attempt} - Enviando ${method} para: ${url}${
        body ? ' (com body)' : ''
      }`
    );

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
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
        return this.sendWithRetry(url, method, body, attempt + 1);
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
  async notifyClinicAddress(
    operation: WebhookOperation,
    id?: string | number
  ): Promise<void> {
    return this.notify(WebhookEntity.CLINIC_ADDRESS, operation, id);
  }

  async notifyClinicHours(
    operation: WebhookOperation,
    id?: string | number
  ): Promise<void> {
    return this.notify(WebhookEntity.CLINIC_HOURS, operation, id);
  }

  async notifyClosures(
    operation: WebhookOperation,
    id?: string | number
  ): Promise<void> {
    return this.notify(WebhookEntity.CLINIC_CLOSURES, operation, id);
  }

  async notifyServices(
    operation: WebhookOperation,
    id?: string | number
  ): Promise<void> {
    return this.notify(WebhookEntity.SERVICES, operation, id);
  }

  async notifyEmployees(
    operation: WebhookOperation,
    id?: string | number
  ): Promise<void> {
    return this.notify(WebhookEntity.EMPLOYEES, operation, id);
  }

  async notifyConvenios(
    operation: WebhookOperation,
    id?: string | number
  ): Promise<void> {
    return this.notify(WebhookEntity.CONVENIOS, operation, id);
  }
}

// Instância singleton
export const webhookService = new WebhookService();
