import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DadosCetic() {
  const [valor, setValor] = useState(null);

  useEffect(() => {
    // Exemplo fictício: no portal Cetic.br pode haver API ou CSV para “% de domicílios com computador”
    // Aqui usamos link genérico – ajuste conforme dataset real que você vai usar
    axios
      .get("https://data.cetic.br/api/your‐endpoint-here.json")
      .then(res => {
        // supondo que res.data.valor exista
        setValor(res.data.valor);
      })
      .catch(err => {
        console.error("Erro ao buscar dados Cetic:", err);
      });
  }, []);

  return (
    <div>
      <h2>Cetic.br: Indicador de Inclusão Digital</h2>
      {valor !== null ? (
        <p>{valor}% dos domicílios com computador</p>
      ) : (
        <p>Carregando…</p>
      )}
    </div>
  );
}
