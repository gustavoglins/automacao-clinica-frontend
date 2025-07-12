import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  resultsCount?: number;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Buscar...",
  autoFocus = false,
  className = "",
  resultsCount
}: SearchBarProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus={autoFocus}
          className="w-full pl-10"
          autoComplete="off"
        />
      </div>
      {value && resultsCount !== undefined && (
        <div className="mt-2 text-xs text-muted-foreground">
          {resultsCount} paciente{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
