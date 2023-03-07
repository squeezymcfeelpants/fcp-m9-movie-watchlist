
// generate an html block for a card for the movie passed in api/watchlist data 'data'
function htmlForMovie(data) {
	return `
	<div class="movie-card" data-mid="${data.imdbID}">
		<div class="movie-thumb">
			<img src="${data.Poster}" alt="movie poster for ${data.Title || ''}">
		</div>
		<div class="movie-info">
			<div class="movie-watchlist-btn">
				<p>Watchlist</p>
				<i class="watchlist-add fa-solid fa-circle-plus hidden"></i>
				<i class="watchlist-remove fa-solid fa-circle-xmark hidden"></i>
			</div>
			<div class="movie-card-row movie-title-rating">
				<div class="movie-title">${data.Title || ''}</div>
				<div class="movie-rating">
					<i class="fa-solid fa-star"></i>
					<p>${data.imdbRating || ''}</p>
				</div>
			</div>
			<div class="movie-card-row">
				<div class="movie-time">${data.Runtime || ''}</div>
				<div class="movie-genre">${data.Genre || ''}</div>
			</div>
			<div class="movie-plot">
				<p>${data.Plot || ''}</p>
				<i class="fa-solid fa-ellipsis movie-plot-more hidden"></i>
			</div>
		</div>
	</div>
	`;
}

// locate the card for the movie with id 'mid' and updates its watchlist button status
function updateMovieWatchlistStatus(mid, watchlist) {
	const card = document.querySelector(`.movie-card[data-mid="${mid}"]`);

	if (card) {
		if (watchlist.contains(mid)) {
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

// add click handlers for movie card watchlist buttons
function addWatchlistButtonHandlers(cb) {
	document.querySelectorAll('.movie-watchlist-btn').forEach((el) => {
		el.addEventListener('click', (ev) => {
			const card = ev.currentTarget.closest('.movie-card');
			if (card) {
				const mid = card.dataset.mid;
				if (mid) {
					return cb(mid, card);
				}
			}
		});
	});
}

//
function fixupOverflowElement(mid) {
	const el = document.querySelector(`.movie-card[data-mid="${mid}"] .movie-plot`);

	if (el) {
		const spillover = el.scrollHeight - el.clientHeight;

		if (spillover > 2) {	// punt if close enough
			const flag = el.querySelector('.movie-plot-more');
			if (flag) {
				flag.classList.remove('hidden');
			}
		}
	};
}

export { htmlForMovie, updateMovieWatchlistStatus, addWatchlistButtonHandlers, fixupOverflowElement };
