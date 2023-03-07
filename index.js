//
import { Watchlist } from './lib/Watchlist.js';
import { htmlForMovie, updateMovieWatchlistStatus, addWatchlistButtonHandlers, fixupOverflowElement } from './lib/common.js';

//
const API_KEY = '38a3a7ad';
const LOCAL_STORAGE_KEY = 'fcp-m9-ls-watchlist';
const inputEl = document.getElementById('fcp-m9-search-text');
const notificationEl = document.getElementById('notification');
const dynContentEl = document.getElementById('dynamic-content');

//
const detailInfo = {};
const watchlist = new Watchlist();
watchlist.readFromLocalStorageKey(LOCAL_STORAGE_KEY);

//
let searching = false;

// main search handler
async function doSearch() {
	const searchText = inputEl.value.trim();

	if (!searching && searchText && searchText.length) {
		searching = true;	// semaphore

		// make the search api call, wait for results
		const movies = await searchMovies(searchText);

		if (movies && movies.length) {
			dynContentEl.innerHTML = movies.map(htmlForMovie).join('');

			//
			addWatchlistButtonHandlers(onWatchlistButton);

			// using a traditional for loop maturally throttles the sequence of fetch requests
			for (let i = 0; i < movies.length; ++i) {
				const { imdbID } = movies[i];

				const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&r=json`);
				const data = await res.json();

				// cache detail data
				detailInfo[imdbID] = data;

				// update the skeleton that's in the dom
				updateMovieData(imdbID, data);

				// update the movie card watchlist button status
				updateMovieWatchlistStatus(imdbID, watchlist);
				fixupOverflowElement(imdbID);
			}

		}
		else {
			dynContentEl.innerHTML = `
			<div class="placeholder">
				<i class="fa-solid fa-triangle-exclamation placeholder-icon"></i>
				<h3 class="placeholder-text">Unable to find what you're looking for. Please try another search.</h3>
			</div>
			`
		}

		searching = false;	// lift semaphore
	}
}

//
function onWatchlistButton(mid, card) {
	if (watchlist.contains(mid)) {
		watchlist.remove(mid);
	}
	else {
		const detail = detailInfo[mid] || {};
		const { imdbID, Title, Poster, imdbRating, Runtime, Genre, Plot } = detail;

		watchlist.add(mid, { imdbID, Title, Poster, imdbRating, Runtime, Genre, Plot });
	}

	// update the watchlist in localStorage
	watchlist.writeToLocalStorageKey(LOCAL_STORAGE_KEY);

	updateMovieWatchlistStatus(mid, watchlist);
	updateNotification();
}

// issue the api fetch to search for movies for the user's search term
async function searchMovies(searchText) {
	const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchText}&type=movie&r=json`);
	const data = await res.json();

	return (data.Response == 'True') ? data.Search : null;
}

// set the notification count widget
function setNotification(value) {
	notificationEl.textContent = value;
	if (value) {
		notificationEl.classList.remove('shrunken');
	}
	else {
		notificationEl.classList.add('shrunken');
	}
}

// update the watchlist notification with current watchlist length
function updateNotification() {
	setNotification(watchlist.count);
}

// update a movie in the DOM matching id 'mid' with api data in 'data'
function updateMovieData(mid, data) {
	const card = document.querySelector(`.movie-card[data-mid="${mid}"]`);

	if (card) {
		card.querySelector('.movie-rating p').textContent = data.imdbRating;
		card.querySelector('.movie-time').textContent = data.Runtime;
		card.querySelector('.movie-genre').textContent = data.Genre;
		card.querySelector('.movie-plot p').textContent = data.Plot;
	}
}

//==============================================================================

document.getElementById('watchlist-btn').addEventListener('click', (e) => {
	window.location.href = 'watchlist.html';
});

document.getElementById('search-btn').addEventListener('click', (e) => {
	doSearch();
});

inputEl.addEventListener('keyup', (e) => {
	if (e.key == 'Enter') {
		doSearch();
	}
});

updateNotification();
