import React, { useEffect, useState } from "react";
import axios from "axios";
import { ResponsiveBar } from '@nivo/bar'

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
            const motivo = motivoRaw ? String(motivoRaw).trim().replace("Serviço de acesso à Internet não estava disponível nos locais que costumavam frequentar", "Internet não disponível em locais frequentados") : null;

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
        }

        /* ----- Uso ----- */
        const items = res.data[0].resultados;
        const resultados = agruparPorAnoNivelMotivo(items);

        setDados(resultados);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados IBGE:", err);
      });
  }, []);

  // const [dadosGraph, setDadosGraph] = useState([]);
  // const [keys, setKeys] = useState([]);

  // useEffect(() => {
  //   const _dadosGraph = [];

  //   dados.forEach((dado) => {
  //     dado.nivel_list.forEach((nivel) => {
  //       const motivos = nivel.motivos.map((m) => ({
  //         nome: m.motivo,
  //         valor: parseFloat(String(m.valor).replace(",", ".")) || 0,
  //       }));

  //       // soma total do nível (para transformar em %)
  //       const total = motivos.reduce((acc, m) => acc + m.valor, 0) || 1;

  //       const motivosPercent = Object.fromEntries(
  //         motivos.map((m) => [m.nome, (m.valor / total) * 100])
  //       );

  //       _dadosGraph.push({
  //         id: `${dado.ano}-${nivel.nivel}`,
  //         ano: dado.ano,
  //         nivel: nivel.nivel,
  //         ...motivosPercent,
  //       });
  //     });
  //   });

  //   const newKeys =
  //     _dadosGraph.length > 0 ? Object.keys(_dadosGraph[0]).filter((k) => !["id", "ano", "nivel"].includes(k)) : [];

  //   setKeys(newKeys);
  //   // setDadosGraph(_dadosGraph);

  //   console.log("✅ _dadosGraph normalizado por nível:", _dadosGraph);
  // }, [dados]);




  //   {
  // 	"result": [
  // 		{
  // 			"id": "5U",
  // 			"OK": 263,
  // 			"NOK": 9
  // 		},
  // 		{
  // 			"id": "BZ",
  // 			"OK": 25,
  // 			"NOK": 2
  // 		},
  // 		{
  // 			"id": "CH",
  // 			"OK": 177,
  // 			"NOK": 11
  // 		},
  // 		{
  // 			"id": "R1",
  // 			"OK": 197,
  // 			"NOK": 11
  // 		}
  // 	]
  // // }
  // useEffect(() => {
  //   if (Array.isArray(dadosGraph) && dadosGraph.length > 0) {
  //     const chaves = Object.keys(dadosGraph[0]).filter(k => k !== "id");
  //     console.log({ chaves, dadosGraph, dados });
  //     setKeys(chaves)
  //   } else {
  //     console.log({ dadosGraph: [] });
  //   }
  // }, [dadosGraph])

  console.log({dados})

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <h2>📊 Distribuição por nível de instrução – Brasil</h2>
            {dados.length > 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: "column"
        }}>
      <div>
        {dados.map((dado, i) => {
          const data = dado.nivel_list.map((nivel) => {
            // soma total de todos os motivos desse nível
            const total = nivel.motivos.reduce((acc, m) => acc + (parseFloat(String(m.valor).replace(",", ".")) || 0), 0);

            const item = { nivel: nivel.nivel };

            nivel.motivos.forEach((motivo) => {
              const valor = parseFloat(String(motivo.valor).replace(",", ".")) || 0;
              // converte para porcentagem relativa dentro do nível
              item[motivo.motivo] = total > 0 ? (valor / total) * 100 : 0;
            });

            return item;
          });

          const keys = [...new Set(dado.nivel_list.flatMap(n => n.motivos.map(m => m.motivo)))];
          return (
            <div key={i} style={{ height: 600, marginBottom: 40 }}>
              <h3 style={{ textAlign: "center" }}>{dado.ano}</h3>

              <ResponsiveBar
                data={data}
                keys={keys}
                indexBy="nivel"
                theme={{
                  axis: { ticks: { text: { fontSize: 11 } } },
                  legends: { text: { fontSize: 12, whiteSpace: 'normal', wordBreak: 'break-word' } }
                }}
                margin={{ top: 50, right: 190, bottom: 50, left: 130 }}
                layout="horizontal"
                labelSkipWidth={12}
                labelSkipHeight={12}
                maxValue={100}
                axisBottom={{ legend: 'Nível', legendOffset: 32 }}
                axisLeft={{ legendOffset: -40 }}
                valueFormat={v => `${v.toFixed(1)}%`}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'right',
                    direction: 'column',
                    translateX: 20,
                    itemsSpacing: 20,
                    itemWidth: 100,
                    itemHeight: 16,
                    symbolSize: 12,
                  },
                ]}
              />
            </div>
          );
        })}

      </div>
      </div>
      ) : (
        <p>Carregando dados do IBGE...</p>
      )}
    </div>
  );
}
