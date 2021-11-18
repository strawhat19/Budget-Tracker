const iDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

let db;
const request = iDB.open(`budgetDB`, 1);

request.onupgradeneeded = ({target}) => {
	let db = target.result;
	db.createObjectStore(`pending`, {autoIncrement: true});
};

request.onsuccess = ({target}) => {
	db = target.result;
	if (navigator.onLine) {
		investigateDatabase();
	}
};

request.onerror = (event) => {
	console.log(`\nREQUEST ERROR: \n${event.target}\n`);
};

function saveRecord(record) {
	const transaction = db.transaction([`pending`], `readwrite`);
	const pendingStore = transaction.objectStore(`pending`);
	pendingStore.add(record);
}

function investigateDatabase() {
	const transaction = db.transaction([`pending`], `readwrite`);
	const pendingStore = transaction.objectStore(`pending`);
	const allPending = pendingStore.getAll();
	allPending.onsuccess = () => {
		if (allPending.result.length > 0) {
			fetch(`/api/transaction/bulk`, {
				method: `POST`,
				body: JSON.stringify(allPending.result),
				headers: {
					Accept: `application/json`,
					'Content-Type': 'application/json',
				},
			})
				.then((response) => {
					return response.json();
				})
				.then(() => {
					const transaction = db.transaction([`pending`], `readwrite`);
					const pendingStore = transaction.objectStore(`pending`);
					pendingStore.clear();
				});
		}
	};
}

window.addEventListener(`online`, investigateDatabase);