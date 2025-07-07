import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useClinic } from "@/context/ClinicContext";

const Configuracoes = () => {
  const { clinicName, setClinicName } = useClinic();
  const [notificacoes, setNotificacoes] = useState(true);
  const [nomeClinica, setNomeClinica] = useState(clinicName);
  const [email, setEmail] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setClinicName(nomeClinica);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-left">Configurações</h1>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Clínica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="nomeClinica">Nome da clínica</Label>
                <Input
                  id="nomeClinica"
                  placeholder="Digite o nome da clínica"
                  value={nomeClinica}
                  onChange={e => setNomeClinica(e.target.value)}
                />
              </div>
              <Button variant="primary" type="submit">Salvar alterações</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Configuracoes;
