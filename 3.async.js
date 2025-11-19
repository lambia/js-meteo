const input = document.getElementById("cittaInput");
const cercaBtn = document.getElementById("cercaBtn");
const output = document.getElementById("output");

/**
 * Cerca le coordinate di una città usando l'API di Open-Meteo.
 * @param {string} nomeCitta - Il nome della città da cercare.
 * @returns {Promise<Object>} - Restituisce un oggetto con i dati della città.
 * @throws {Error} - Se la città non viene trovata o c'è un errore di rete.
 */
async function cercaCoordinate(nomeCitta) {
	const url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(nomeCitta);

	const response = await axios.get(url);

	// Verifica se ci sono risultati
	if (!response.data.results || response.data.results.length === 0) {
		throw new Error("Città non trovata");
	}

	// Restituisce il primo risultato
	return response.data.results[0];
}

/**
 * Recupera il meteo corrente da Open-Meteo.
 * @param {number} lat - Latitudine della città.
 * @param {number} lon - Longitudine della città.
 * @returns {Promise<Object>} - L'oggetto meteo (temperatura, ecc.).
 * @throws {Error} - Se ci sono errori di rete o coordinate non valide.
 */
async function ottieniMeteo(lat, lon) {
	// Validazione coordinate prima della chiamata API
	if (!lat || !lon) {
		throw new Error("Coordinate non valide");
	}

	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;

	const response = await axios.get(url);

	// Verifica che i dati meteo siano presenti
	if (!response.data.current || response.data.current.temperature_2m === undefined) {
		throw new Error("Dati meteo non disponibili");
	}

	return response.data.current;
}

/**
 * Mostra nel DOM il meteo ottenuto.
 * @param {string} nome - Nome della città.
 * @param {number} temperatura - Temperatura corrente in °C.
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
 * Gestisce il flusso principale quando l'utente clicca "Cerca".
 * Usa async/await per gestione sincrona del codice asincrono.
 */
cercaBtn.addEventListener("click", async function () {
	const nome = input.value.trim();

	// Controllo input vuoto
	if (nome === "") {
		output.textContent = "Inserire una città.";
		return;
	}

	output.textContent = "Ricerca in corso...";
	cercaBtn.disabled = true; // Previene click multipli

	try {
		// Attende il risultato della ricerca coordinate
		const coord = await cercaCoordinate(nome);

		// Attende il risultato del meteo
		const meteo = await ottieniMeteo(coord.latitude, coord.longitude);

		// Mostra il risultato
		mostraMeteo(coord.name, meteo.temperature_2m);

	} catch (err) {
		// Gestione centralizzata di tutti gli errori con try/catch
		console.error("Errore:", err);
		output.textContent = err.message || "Errore nella ricerca del meteo.";
		document.body.style.background = "#f2f2f2";

	} finally {
		// Riabilita il bottone in ogni caso
		cercaBtn.disabled = false;
	}
});