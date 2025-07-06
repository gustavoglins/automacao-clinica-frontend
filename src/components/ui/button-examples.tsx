import { Button } from "./button"
import { Plus, Edit, Trash2, Check } from "lucide-react"

// Exemplo de uso das novas variantes de botão
export const ButtonExamples = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Variantes de Botão</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Botões Sólidos</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>

            <Button variant="success" className="gap-2">
              <Check className="w-4 h-4" />
              Confirmar
            </Button>

            <Button variant="warning" className="gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>

            <Button variant="danger" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Deletar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Botões Outline</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline-primary" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Paciente
            </Button>

            <Button variant="outline-success" className="gap-2">
              <Check className="w-4 h-4" />
              Confirmar
            </Button>

            <Button variant="outline-warning" className="gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>

            <Button variant="outline-danger" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Deletar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Tamanhos</h3>
          <div className="flex gap-2 items-center">
            <Button variant="primary" size="sm">
              Pequeno
            </Button>
            <Button variant="primary" size="default">
              Padrão
            </Button>
            <Button variant="primary" size="lg">
              Grande
            </Button>
            <Button variant="primary" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
