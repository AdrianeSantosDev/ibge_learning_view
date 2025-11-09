import DadosIBGEGraph from "./components/DadosIBGEGraph";

function App() {
  return (
    <div style={{ width: "100%", padding: 20, fontFamily: "Arial, sans-serif", display: "flex", justifyContent: 'center', alignItems: "center", flexDirection: "column", textAlign: "center" }}>
      <h1>Distribuição percentual das pessoas de 10 anos ou mais de idade<br/> que não utilizaram Internet no período de referência dos últimos três meses</h1>

      <section style={{ margin: "40px 0", width: "100%" }}>
        <DadosIBGEGraph />
      </section>

      <footer style={{ marginTop: 60, fontSize: "0.8em", color: "#555" }}>
        Fonte: IBGE
      </footer>
    </div>
  );
}

export default App;
