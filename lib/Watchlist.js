//
class Watchlist {
	//
	#watchlist = [];

	constructor() {
	}

	//
	get watchlist() {
		return this.#watchlist;
	}

	//
	get count() {
		return this.#watchlist.length;
	}

	// return boolean indicating if movie with id 'mid' is in the watchlist
	contains(mid) {
		return this.#watchlist.findIndex((e) => e.mid == mid) >= 0;
	}

	// add movie with id 'mid' to the watchlist
	add(mid, data = {}) {
		if (!this.contains(mid)) {	// prevent dupes
			this.#watchlist.push({ ...data, mid });
		}

		return this;
	}

	// remove movie with id 'mid' from the watchlist
	remove(mid) {
		const idx = this.#watchlist.findIndex((e) => e.mid == mid);
		if (idx >= 0) {
			this.#watchlist.splice(idx, 1);
		}

		return this;
	}

	//
	writeToLocalStorageKey(key) {
		localStorage.setItem(key, JSON.stringify(this.#watchlist));

		return this;
	}

	//
	readFromLocalStorageKey(key) {
		const data = localStorage.getItem(key);
		this.#watchlist = data ? JSON.parse(data) : [];

		return this;
	}
}

export { Watchlist };
