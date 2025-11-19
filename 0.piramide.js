const input = document.getElementById("cittaInput");
const cercaBtn = document.getElementById("cercaBtn");
const output = document.getElementById("output");

/**
 * Gestisce il flusso principale quando l'utente clicca "Cerca".
 * Tutto inline senza funzioni separate.
 */
cercaBtn.addEventListener("click", function () {
	const nome = input.value.trim();

	// Controllo input vuoto
	if (nome === "") {
		output.textContent = "Inserire una città.";
		return;
	}

	output.textContent = "Ricerca in corso...";

	// 1. Chiamata API per cercare le coordinate
	const urlCoordinate = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(nome);

	axios.get(urlCoordinate).then(r => {
		// Verifica se ci sono risultati
		if (!r.data.results || r.data.results.length === 0) {
			output.textContent = "Città non trovata.";
			return;
		}

		// Prende il primo risultato
		const coord = r.data.results[0];

		// 2. Chiamata API per ottenere il meteo (annidata, non chain)
		const urlMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${coord.latitude}&longitude=${coord.longitude}&current=temperature_2m`;

		axios.get(urlMeteo).then(rMeteo => {
			// Verifica se ci sono dati meteo
			if (!rMeteo.data.current) {
				output.textContent = "Errore nel recupero del meteo.";
				return;
			}

			const meteo = rMeteo.data.current;
			const temperatura = meteo.temperature_2m;

			// 3. Mostra il risultato nel DOM
			output.textContent = `Città: ${coord.name} — Temperatura: ${temperatura}°C`;

			// 4. Cambia lo sfondo in base alla temperatura
			if (temperatura > 25) {
				document.body.style.background = "#ffddaa"; // Caldo
			} else if (temperatura < 10) {
				document.body.style.background = "#cfe7ff"; // Freddo
			} else {
				document.body.style.background = "#f2f2f2"; // Neutro
			}
		}).catch(err => {
			// Errore nella chiamata meteo
			console.error("Errore meteo:", err);
			output.textContent = "Errore nel recupero del meteo.";
			document.body.style.background = "#f2f2f2";
		});

	}).catch(err => {
		// Errore nella chiamata coordinate
		console.error("Errore coordinate:", err);
		output.textContent = "Errore nella ricerca della città.";
		document.body.style.background = "#f2f2f2";
	});
});