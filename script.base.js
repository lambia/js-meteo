const input = document.getElementById("cittaInput");
const cercaBtn = document.getElementById("cercaBtn");
const output = document.getElementById("output");

/**
 * Cerca le coordinate di una città usando l'API di Open-Meteo.
 * @param {string} nomeCitta - Il nome della città da cercare.
 * @returns {Promise<Object|null>} - Restituisce un oggetto con i dati della città o null se non trovata.
 */
function cercaCoordinate(nomeCitta) {
	const url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(nomeCitta);

	const chiamata = axios.get(url).then(r => {

		if (!r.data.results || r.data.results.length === 0) {
			return null
		};
		return r.data.results[0];

	}).catch(() => null);

	return chiamata;
}

/**
 * Recupera il meteo corrente da Open-Meteo.
 * @param {number} lat - Latitudine della città.
 * @param {number} lon - Longitudine della città.
 * @returns {Promise<Object|null>} - L'oggetto meteo (temperatura, ecc.) oppure null se errore.
 */
function ottieniMeteo(lat, lon) {
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;

	const chiamata = axios.get(url).then(r => r.data.current).catch(() => null);

	return chiamata;
}

/**
 * Mostra nel DOM il meteo ottenuto.
 * @param {Object} info - Informazioni da mostrare.
 * @param {string} info.nome - Nome della città.
 * @param {number} info.temperatura - Temperatura corrente in °C.
 */
function mostraMeteo(nome, temperatura) {
	output.textContent = `Città: ${nome} — Temperatura: ${temperatura}°C`;

	const t = temperatura;

	if (t > 25) {
		document.body.style.background = "#ffddaa";
	} else if (t < 10) {
		document.body.style.background = "#cfe7ff";
	} else {
		document.body.style.background = "#f2f2f2";
	}
}

/**
 * Gestisce il flusso principale quando l’utente clicca "Cerca".
 */
cercaBtn.onclick = function () {
	const nome = input.value.trim();

	if (nome === "") {
		output.textContent = "Inserire una città.";
		return;
	}

	output.textContent = "Ricerca in corso...";

	cercaCoordinate(nome).then(coord => {
		if (!coord) {
			output.textContent = "Città non trovata.";
			return;
		}

		// Chiamata diretta senza return annidati
		ottieniMeteo(coord.latitude, coord.longitude).then(meteo => {
			if (!meteo) {
				output.textContent = "Errore nel recupero del meteo.";
				return;
			}

			mostraMeteo(coord.name, meteo.temperature_2m);
		});

	});
};
