import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DadosIBGE() {
  const [dados, setDados] = useState([]);

  // https://servicodados.ibge.gov.br/api/v3/agregados/4827/periodos/-6/variaveis/5007?localidades=N1[1]&classificacao=1568[18837,120712,120713,120714,120715,99712,99713,11626]
  useEffect(() => {
    axios
      .get(
        "https://servicodados.ibge.gov.br/api/v3/agregados/9660/periodos/2022|2023|2024/variaveis/10652?localidades=N1[all]&classificacao=1568[18837,120712,120713,120714,120715,99712,99713]|425[48614,48615,48616,12054,11043,11320]"
        // "https://servicodados.ibge.gov.br/api/v3/agregados/7330/periodos/2019|2021|2022|2023|2024/variaveis/10650?localidades=N1[all]&classificacao=1568[9493,120713,120714,120715,99712,99713]"
      )
      .then((res) => {
        // O retorno vem como um array com vários blocos (um por nível de instrução)

        // items: res.data[0].resultados
        function agruparPorAnoNivelMotivo(items) {
          const resultados = []; // [{ ano, nivel_list: [{ nivel, motivos: [{ motivo, valor }] }] }]

          items.forEach((item) => {
            const serie = item.series?.[0]?.serie || {};
            const classificacoes = item.classificacoes || [];

            const nivelObj = classificacoes.find(el => el.nome && el.nome.includes("Nível"));
            const motivoObj = classificacoes.find(el => el.nome && el.nome.includes("Motivo"));

            // normaliza strings para evitar duplicatas por case/espaco
            const nivelRaw = nivelObj ? Object.values(nivelObj.categoria)[0] : "Indefinido";
            const motivoRaw = motivoObj ? Object.values(motivoObj.categoria)[0] : null;
            const nivel = String(nivelRaw ?? "Indefinido").trim();
            const motivo = motivoRaw ? String(motivoRaw).trim() : null;

            // percorre todos os anos da série (ex: "2022": "6.0", "2023": "6.1", ...)
            Object.entries(serie).forEach(([ano, valorRaw]) => {
              const valor = valorRaw == null ? null : String(valorRaw).trim();

              // encontra ou cria o objeto do ano
              let anoObj = resultados.find(r => r.ano === ano);
              if (!anoObj) {
                anoObj = { ano, nivel_list: [] };
                resultados.push(anoObj);
              }

              // dentro do ano, encontra ou cria o nível
              let nivelObjAno = anoObj.nivel_list.find(n => n.nivel === nivel);
              if (!nivelObjAno) {
                nivelObjAno = { nivel, motivos: [] };
                anoObj.nivel_list.push(nivelObjAno);
              }

              // dentro do nível, encontra se já existe esse motivo
              if (motivo) {
                let motivoObjNivel = nivelObjAno.motivos.find(m => m.motivo === motivo);
                if (!motivoObjNivel) {
                  // adiciona novo motivo com o valor deste ano
                  nivelObjAno.motivos.push({ motivo, valor });
                } else {
                  // se já existir, atualiza/garante o valor (evita duplicação)
                  // você pode decidir como tratar conflitos — aqui sobrescrevemos se valor diferente
                  motivoObjNivel.valor = valor;
                }
              }
            }); // fim anos
          }); // fim items.forEach

          // opcional: ordenar anos crescente
          resultados.sort((a, b) => a.ano.localeCompare(b.ano));

          return resultados;
        };

        /* ----- Uso ----- */
        const items = res.data[0].resultados;
        const resultados = agruparPorAnoNivelMotivo(items);

        setDados(resultados);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados IBGE:", err);
      });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <h2>📊 Distribuição por nível de instrução – Brasil</h2>

      {dados.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: "column"
        }}>
          {dados.map((dado, i) => (
            <>
              <br />
              <div> Ano {dado.ano} </div>
              <br />
              <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Nível de Instrução</th>
                    <th>Percentual (%)</th>
                  </tr>
                </thead>

                <tbody>
                  {dado.nivel_list.map((nivel, i) => (
                    <tr key={i}>
                      <td>{nivel.nivel}</td>
                      <td>
                        {nivel.motivos.map((motivo, j) => (
                          <div key={j}>
                            {motivo.motivo}: {motivo.valor}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </>
          ))}
        </div>
      ) : (
        <p>Carregando dados do IBGE...</p>
      )}
    </div>
  );
}
