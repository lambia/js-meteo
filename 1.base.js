const input = document.getElementById("cittaInput");
const cercaBtn = document.getElementById("cercaBtn");
const output = document.getElementById("output");

/**
 * Cerca le coordinate di una città usando l'API di Open-Meteo.
 * @param {string} nomeCitta - Il nome della città da cercare.
 * @returns {Promise<Object>} - Restituisce un oggetto con i dati della città.
 * @throws {Error} - Se la città non viene trovata o c'è un errore di rete.
 */
function cercaCoordinate(nomeCitta) {
	const url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(nomeCitta);

	const chiamata = axios.get(url).then(r => {
		// Verifica se ci sono risultati
		if (!r.data.results || r.data.results.length === 0) {
			throw new Error("Città non trovata");
		}
		// Restituisce il primo risultato
		return r.data.results[0];
	});

	return chiamata;

}

/**
 * Recupera il meteo corrente da Open-Meteo.
 * @param {number} lat - Latitudine della città.
 * @param {number} lon - Longitudine della città.
 * @returns {Promise<Object>} - L'oggetto meteo (temperatura, ecc.).
 * @throws {Error} - Se ci sono errori di rete o coordinate non valide.
 */
function ottieniMeteo(lat, lon) {
	// Validazione coordinate
	if (!lat || !lon) {
		throw new Error("Coordinate non valide");
	}

	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;

	const chiamata = axios.get(url).then(r => {
		// Verifica che i dati meteo siano presenti
		if (!r.data.current || r.data.current.temperature_2m === undefined) {
			throw new Error("Dati meteo non disponibili");
		}
		return r.data.current;
	});

	return chiamata;
}

/**
 * Mostra nel DOM il meteo ottenuto.
 * @param {string} nome - Nome della città.
 * @param {number} temperatura - Temperatura corrente in °C.
 * @throws {Error} - Se la temperatura non è valida.
 */
function mostraMeteo(nome, temperatura) {
	// Validazione temperatura
	if (temperatura === undefined || temperatura === null) {
		throw new Error("Temperatura non valida");
	}

	output.textContent = `Città: ${nome} — Temperatura: ${temperatura}°C`;

	const t = temperatura;

	// Cambia lo sfondo in base alla temperatura
	if (t > 25) {
		document.body.style.background = "#ffddaa"; // Caldo
	} else if (t < 10) {
		document.body.style.background = "#cfe7ff"; // Freddo
	} else {
		document.body.style.background = "#f2f2f2"; // Neutro
	}
}

/**
 * Gestisce il flusso principale quando l’utente clicca "Cerca".
 */
cercaBtn.addEventListener("click", function () {
	const nome = input.value.trim();

	if (nome === "") {
		output.textContent = "Inserire una città.";
		return;
	}

	output.textContent = "Ricerca in corso...";
	cercaBtn.disabled = true; // Previene click multipli

	cercaCoordinate(nome)
		.then(coord => {
			// Chiamata meteo con le coordinate ottenute
			ottieniMeteo(coord.latitude, coord.longitude)
				.then(meteo => {
					mostraMeteo(coord.name, meteo.temperature_2m);
					cercaBtn.disabled = false;
				})
				.catch(err => {
					// Catch specifico per errori di ottieniMeteo e mostraMeteo
					console.error("Errore meteo:", err);
					output.textContent = err.message || "Errore nel recupero del meteo.";
					document.body.style.background = "#f2f2f2";
					cercaBtn.disabled = false;
				});
		})
		.catch(err => {
			// Catch specifico per errori di cercaCoordinate
			console.error("Errore coordinate:", err);
			output.textContent = err.message || "Errore nella ricerca della città.";
			document.body.style.background = "#f2f2f2";
			cercaBtn.disabled = false;
		});
});