const converterForm = document.getElementById("converterForm");
const apiUrl = "https://mindicador.cl/api/";
let myCanvasChart = null;

converterForm.addEventListener("submit", function (e) {
  e.preventDefault();
  convert();
  loadChart();
});

const initializeCurrencyData = async () => {
  try {
    const response = await fetch(apiUrl);
    const currencyData = await response.json();

    const currencyFiltered = Object.keys(currencyData).filter(
      (element) => currencyData[element]["unidad_medida"] === "Pesos"
    );

    const currencyInfo = currencyFiltered.map((element) => ({
      code: currencyData[element]["codigo"],
      name: currencyData[element]["nombre"],
      value: currencyData[element]["valor"],
    }));

    const selectContainer = document.querySelector("#currencySelected");

    currencyInfo.forEach((element) => {
      selectContainer.innerHTML += `
              <option value="${element.code}">${element.name}</option>
          `;
    });
  } catch (error) {
    console.log(error);
  }
};

const getCurrencyData = async (currency) => {
  const response = await fetch(`${apiUrl}${currency}`);
  const data = await response.json();
  const dataFiltered = data.serie.splice(0, 10);
  return dataFiltered;
};

const convert = async () => {
  try {
    const amount = document.getElementById("amountInput").value;
    const currency = document.getElementById("currencySelected").value;
    const data = await getCurrencyData(currency);

    const currencyValue = data[0].value;
    const result = amount / currencyValue;

    document.getElementById("result").innerText = `Resultado: ${result.toFixed(
      2
    )} ${currency.toUpperCase()}`;
  } catch (error) {
    console.log(error);
    document.getElementById("result").innerText = `Error: ${error.message}`;
  }
}

const loadChart = async () => {
  try {
    const loading = document.getElementById("loading");
    loading.innerText = "Cargando...";
    loading.style.display = "block";
  
    const currency = document.getElementById("currencySelected").value;
  
    if (myCanvasChart) myCanvasChart.destroy();
  
    const currencyData = await getCurrencyData(currency);
  
    const labels = currencyData.map((element) => new Date(element.fecha).toLocaleDateString("es-CL"));
    const data = currencyData.map((element) => element.value);
    const datasets = [
      {
        label: currency,
        borderColor: "rgb(255, 255, 255)",
        data,
      },
    ];
    const data_render = { labels, datasets };
    handleRenderChart(data_render);
  
  } catch (error) {
    document.getElementById("result").innerText = "Error: Tipo de moneda no válido";
  }  finally {
    loading.style.display = "none";
    loading.innerText = "";
  }
}

const handleRenderChart = (data) => {
  const config = {
    type: "line",
    data,
    options: {
      plugins: {
        legend: {
          labels: {
            color: "white",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "white",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        y: {
          ticks: {
            color: "white",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  };
  const myChart = document.getElementById("chart");
  myChart.style.backgroundColor = "#6c757d";
  myCanvasChart = new Chart(myChart, config);
};

initializeCurrencyData();
