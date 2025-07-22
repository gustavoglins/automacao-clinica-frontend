import React from "react";

/**
 * Componente para exibir nota sobre campos obrigatórios em formulários
 * 
 * @example
 * // Uso básico (dentro de DialogHeader)
 * <DialogHeader>
 *   <DialogTitle>Criar Item</DialogTitle>
 *   <RequiredFieldsNote />
 * </DialogHeader>
 * 
 * // Com classe personalizada
 * <RequiredFieldsNote className="text-xs text-gray-500" />
 */

interface RequiredFieldsNoteProps {
  className?: string;
}

export const RequiredFieldsNote: React.FC<RequiredFieldsNoteProps> = ({
  className = "text-sm text-muted-foreground mt-2"
}) => {
  return (
    <p className={className}>
      {/* Texto removido conforme solicitado */}
    </p>
  );
};
