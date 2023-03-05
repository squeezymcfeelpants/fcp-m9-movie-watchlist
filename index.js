
//
const API_KEY = '38a3a7ad';
const inputEl = document.getElementById('fcp-m9-search-text');
const notificationEl = document.getElementById('notification');
const searchResultsEl = document.getElementById('search-results');

//
const watchlist = [];

//
let searching = false;
let searchResults = null;

// main search handler
async function doSearch() {
	const searchText = inputEl.value.trim();

	if (!searching && searchText && searchText.length) {
		searching = true;	// semaphore

		// make the search api call, wait for results
		searchResults = await searchMovies(searchText);

		if (searchResults && searchResults.length) {
			searchResultsEl.innerHTML = searchResults.map(htmlForMovie).join('');

			//
			addWatchlistButtonHandlers();

			// using a traditional for loop maturally throttles the sequence of fetch requests
			for (let i = 0; i < searchResults.length; ++i) {
				const { imdbID } = searchResults[i];

				const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&r=json`);
				const data = await res.json();

				// update the skeleton that's in the dom
				updateMovieData(imdbID, data);

				// update the movie card watchlist button status
				updateMovieWatchlistStatus(imdbID);
			}
		}
		else {
			searchResultsEl.innerHTML = `
			<div class="placeholder">
				<i class="fa-solid fa-triangle-exclamation placeholder-icon"></i>
				<h3 class="placeholder-text">Unable to find what you're looking for. Please try another search.</h3>
			</div>
			`
		}

		searching = false;	// lift semaphore
	}
}

// add click handlers for movie card watchlist buttons, with handler code
function addWatchlistButtonHandlers() {
	document.querySelectorAll('.movie-watchlist-btn').forEach((el) => {
		el.addEventListener('click', (ev) => {
			const card = ev.currentTarget.closest('.movie-card');
			const mid = card.dataset.mid;

			if (mid) {
				if (watchlistContains(mid)) {
					watchlistRemove(mid);
				}
				else {
					watchlistAdd(mid);
				}

				updateMovieWatchlistStatus(mid);
				updateNotification();
			}
		});
	});
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
	setNotification(watchlist.length);
}

// generate an html block for a card for the movie passed in api data 'data'
function htmlForMovie(data) {
	return `
	<div class="movie-card" data-mid="${data.imdbID}">
		<div class="movie-thumb">
			<img src="${data.Poster}" alt="movie poster for ${data.Title}">
		</div>
		<div class="movie-info">
			<div class="movie-watchlist-btn">
				<p>Watchlist</p>
				<i class="watchlist-add fa-solid fa-circle-plus hidden"></i>
				<i class="watchlist-remove fa-solid fa-circle-xmark hidden"></i>
			</div>
			<div class="movie-card-row movie-title-rating">
				<div class="movie-title">${data.Title}</div>
				<div class="movie-rating">
					<i class="fa-solid fa-star"></i>
					<p></p>
				</div>
			</div>
			<div class="movie-card-row">
				<div class="movie-time"></div>
				<div class="movie-genre"></div>
			</div>
			<div class="movie-plot">
				<p></p>
			</div>
		</div>
	</div>
	`;
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

// locate the card for the movie with id 'mid' and updates its watchlist button status
function updateMovieWatchlistStatus(mid) {
	const card = document.querySelector(`.movie-card[data-mid="${mid}"]`);

	if (card) {
		if (watchlistContains(mid)) {
			// display remove button
			card.querySelector('.watchlist-add').classList.add('hidden');
			card.querySelector('.watchlist-remove').classList.remove('hidden');
		}
		else {
			// display add button
			card.querySelector('.watchlist-add').classList.remove('hidden');
			card.querySelector('.watchlist-remove').classList.add('hidden');
		}
	}
}

// return boolean indicating if movie with id 'mid' is in the watchlist
function watchlistContains(mid) {
	return watchlist.findIndex((e) => e.mid == mid) >= 0
}

// add movie with id 'mid' to the watchlist
function watchlistAdd(mid) {
	if (!watchlistContains(mid)) {	// prevent dupes
		watchlist.push({ mid });
	}
}

// remove movie with id 'mid' from the watchlist
function watchlistRemove(mid) {
	const idx = watchlist.findIndex((e) => e.mid == mid);
	if (idx >= 0) {
		watchlist.splice(idx, 1);
	}
}

//==============================================================================

//
document.getElementById('search-btn').addEventListener('click', (e) => {
	doSearch();
});

inputEl.addEventListener('keyup', (e) => {
	if (e.key == 'Enter') {
		doSearch();
	}
});

// TODO: get watchlist from localStorage
updateNotification();
