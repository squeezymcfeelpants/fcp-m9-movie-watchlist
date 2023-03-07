//
import { Watchlist } from './lib/Watchlist.js';
import { htmlForMovie, updateMovieWatchlistStatus, addWatchlistButtonHandlers, fixupOverflowElement } from './lib/common.js';

//
const LOCAL_STORAGE_KEY = 'fcp-m9-ls-watchlist';
const dynContentEl = document.getElementById('dynamic-content');

//
const watchlist = new Watchlist();
watchlist.readFromLocalStorageKey(LOCAL_STORAGE_KEY);

//
function renderWatchlist() {
	const movies = watchlist.watchlist;

	if (movies && movies.length) {
		dynContentEl.innerHTML = movies.map(htmlForMovie).join('');

		//
		addWatchlistButtonHandlers(onWatchlistButton);

		//
		movies.forEach((data) => {
			updateMovieWatchlistStatus(data.mid, watchlist);
		});

		//
		setTimeout(() => {
			movies.forEach((data) => {
				fixupOverflowElement(data.mid);
			});
		}, 250);
	}
	else {
		dynContentEl.innerHTML = `
		<div class="placeholder">
			<i class="fa-solid fa-battery-empty placeholder-icon"></i>
			<h3 class="placeholder-text">Your watchlist is looking a little empty...</h3>
		</div>
		`
	}
}

//
function onWatchlistButton(mid, card) {
	if (watchlist.contains(mid)) {
		watchlist.remove(mid);

		// update the watchlist in localStorage
		watchlist.writeToLocalStorageKey(LOCAL_STORAGE_KEY);

		renderWatchlist();
	}
}

//==============================================================================

document.getElementById('search-btn').addEventListener('click', (e) => {
	window.location.href = 'index.html';
});

renderWatchlist();
