import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para remover caracteres não numéricos
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, "");
}

// Função para formatar telefone brasileiro
export function formatPhone(value: string): string {
  const numbers = onlyNumbers(value);

  // Se não tem números, retorna vazio
  if (!numbers) return "";

  // Se tem menos de 10 dígitos, não formata
  if (numbers.length < 10) return numbers;

  // Se tem 10 dígitos (telefone fixo): (XX) XXXX-XXXX
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  // Se tem 11 dígitos (celular): (XX) XXXXX-XXXX
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  // Se tem mais de 11 dígitos, pega apenas os primeiros 11
  if (numbers.length > 11) {
    const truncated = numbers.substring(0, 11);
    return truncated.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return numbers;
}

// Função para validar telefone brasileiro (versão mais flexível)
export function isValidPhone(value: string): boolean {
  const numbers = onlyNumbers(value);

  // Deve ter pelo menos 10 dígitos (telefone fixo) ou 11 (celular)
  if (numbers.length < 10 || numbers.length > 11) return false;

  // Deve começar com código de área válido (11-99)
  const areaCode = parseInt(numbers.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;

  // Para números com 11 dígitos (celulares)
  if (numbers.length === 11) {
    // O terceiro dígito deve ser 9 para celulares
    return numbers[2] === "9";
  }

  // Para números com 10 dígitos (telefones fixos)
  if (numbers.length === 10) {
    // Aceita qualquer terceiro dígito válido para telefone fixo
    const thirdDigit = numbers[2];
    // Apenas rejeita 0 e 1 que são inválidos
    return thirdDigit !== "0" && thirdDigit !== "1";
  }

  return true;
}

// Função auxiliar para obter informações sobre o telefone
export function getPhoneInfo(value: string): { type: string; isValid: boolean; message: string } {
  const numbers = onlyNumbers(value);

  if (numbers.length === 0) {
    return { type: "empty", isValid: false, message: "Telefone é obrigatório" };
  }

  if (numbers.length < 10) {
    return { type: "incomplete", isValid: false, message: "Telefone deve ter pelo menos 10 dígitos" };
  }

  if (numbers.length > 11) {
    return { type: "too_long", isValid: false, message: "Telefone deve ter no máximo 11 dígitos" };
  }

  const areaCode = parseInt(numbers.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) {
    return { type: "invalid_area", isValid: false, message: "Código de área inválido (11-99)" };
  }

  if (numbers.length === 11) {
    if (numbers[2] !== "9") {
      return { type: "invalid_mobile", isValid: false, message: "Celular deve começar com 9 após o DDD" };
    }
    return { type: "mobile", isValid: true, message: "Celular válido" };
  }

  if (numbers.length === 10) {
    const thirdDigit = numbers[2];
    if (thirdDigit === "0" || thirdDigit === "1") {
      return { type: "invalid_landline", isValid: false, message: "Telefone fixo não pode começar com 0 ou 1" };
    }
    return { type: "landline", isValid: true, message: "Telefone fixo válido" };
  }

  return { type: "unknown", isValid: false, message: "Formato de telefone inválido" };
}

// Função para aplicar máscara de telefone em tempo real
export function applyPhoneMask(value: string): string {
  const numbers = onlyNumbers(value);

  // Aplicar máscara progressivamente conforme o usuário digita
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{2})(\d*)/, "($1) $2");
  } else if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d*)/, "($1) $2-$3");
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  }
}

// Função para aplicar máscara de CPF em tempo real
export function applyCpfMask(value: string): string {
  const numbers = onlyNumbers(value);

  // Aplicar máscara progressivamente conforme o usuário digita
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{3})(\d*)/, "$1.$2");
  } else if (numbers.length <= 9) {
    return numbers.replace(/(\d{3})(\d{3})(\d*)/, "$1.$2.$3");
  } else {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
  }
}

// Função para validar CPF
export function isValidCpf(value: string): boolean {
  const numbers = onlyNumbers(value);

  // Deve ter exatamente 11 dígitos
  if (numbers.length !== 11) return false;

  // Deve conter apenas números
  if (!/^\d{11}$/.test(numbers)) return false;

  // Verificar se não são todos os mesmos dígitos
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Algoritmo de validação do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;

  return true;
}

// ===== FUNÇÕES DE TRANSFORMAÇÃO DE DADOS =====

/**
 * Transforma texto com underscores para formato legível
 * Ex: "auxiliar_saude_bucal" -> "Auxiliar Saude Bucal"
 */
export function formatUnderscoreText(text: string): string {
  if (!text) return '';

  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Transforma cargo do banco para formato legível
 * Ex: "auxiliar_saude_bucal" -> "Auxiliar de Saúde Bucal"
 */
export function formatRole(role: string): string {
  if (!role) return 'Cargo não informado';

  const roleMap: Record<string, string> = {
    'dentista': 'Dentista',
    'auxiliar_saude_bucal': 'Auxiliar de Saúde Bucal',
    'recepcionista': 'Recepcionista',
    'gerente': 'Gerente',
    'ortodontista': 'Ortodontista',
    'endodontista': 'Endodontista',
    'periodontista': 'Periodontista',
    'implantodontista': 'Implantodontista',
    'cirurgiao_buco_maxilo': 'Cirurgião Bucomaxilofacial',
    'higienista': 'Higienista',
    'tecnico_saude_bucal': 'Técnico em Saúde Bucal'
  };

  return roleMap[role.toLowerCase()] || formatUnderscoreText(role);
}

/**
 * Transforma especialidade do banco para formato legível
 * Ex: "ortodontista" -> "Ortodontia"
 */
export function formatSpecialty(specialty: string): string {
  if (!specialty) return '';

  const specialtyMap: Record<string, string> = {
    'ortodontista': 'Ortodontia',
    'endodontista': 'Endodontia',
    'periodontista': 'Periodontia',
    'implantodontista': 'Implantodontia',
    'cirurgiao_buco_maxilo': 'Cirurgia Oral',
    'clinico_geral': 'Clínica Geral',
    'odontopediatra': 'Odontopediatria',
    'protesista': 'Prótese',
    'radiologista': 'Radiologia',
    'odontologia_estetica': 'Odontologia Estética'
  };

  return specialtyMap[specialty.toLowerCase()] || formatUnderscoreText(specialty);
}

/**
 * Transforma status do banco para formato legível
 * Ex: "em_ferias" -> "Em Férias"
 */
export function formatStatus(status: string): string {
  if (!status) return 'Status não informado';

  const statusMap: Record<string, string> = {
    'ativo': 'Ativo',
    'inativo': 'Inativo',
    'demitido': 'Demitido',
    'em_ferias': 'Em Férias',
    'licenca': 'Licença',
    'afastado': 'Afastado',
    'suspenso': 'Suspenso'
  };

  return statusMap[status.toLowerCase()] || formatUnderscoreText(status);
}

/**
 * Transforma qualquer valor do banco para formato legível
 * Usa as funções específicas quando disponível, senão usa formatUnderscoreText
 */
export function formatDatabaseValue(value: string, type: 'role' | 'specialty' | 'status' | 'general' = 'general'): string {
  if (!value) return '';

  switch (type) {
    case 'role':
      return formatRole(value);
    case 'specialty':
      return formatSpecialty(value);
    case 'status':
      return formatStatus(value);
    default:
      return formatUnderscoreText(value);
  }
}
