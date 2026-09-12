const apiBase = import.meta.env.VITE_API_URL || '/api';
const tokenKey = 'saathi_access_token';
const userKey = 'user';

async function request(path, options = {}) {
	const token = localStorage.getItem(tokenKey);
	const response = await fetch(`${apiBase}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers || {}),
		},
	});
	const payload = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(payload.error || 'Request failed');
	return payload;
}

const auth = {
	async signUp({ email, password, options }) {
		const payload = await request('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ email, password, fullName: options?.data?.username || '' }),
		});
		return { data: payload, error: null };
	},
	async signInWithPassword({ email, password }) {
		const payload = await request('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
		localStorage.setItem(tokenKey, payload.session.access_token);
		localStorage.setItem(userKey, JSON.stringify({ user: payload.user }));
		return { data: payload, error: null };
	},
	async getUser() {
		if (!localStorage.getItem(tokenKey)) {
			return { data: { user: null }, error: null };
		}
		try {
			const payload = await request('/auth/me');
			return { data: { user: payload.user }, error: null };
		} catch {
			return { data: { user: null }, error: null };
		}
	},
	async getSession() {
		const access_token = localStorage.getItem(tokenKey);
		if (!access_token) return { data: { session: null }, error: null };
		const { data: { user } } = await auth.getUser();
		return user ? { data: { session: { access_token, user } }, error: null } : { data: { session: null }, error: null };
	},
	async updateUser(values) {
		await request('/auth/password', { method: 'PATCH', body: JSON.stringify(values) });
		return { data: null, error: null };
	},
	async signOut() {
		localStorage.removeItem(tokenKey);
		localStorage.removeItem(userKey);
		return { error: null };
	},
};

function tableQuery(table) {
	const filters = [];
	let order;
	let limit;
	let method = 'GET';
	let body;
	let single = false;
	const builder = {
		select() { return builder; },
		eq(field, value) { filters.push([field, value]); return builder; },
		gte(field, value) { filters.push([`gte_${field}`, value]); return builder; },
		lte(field, value) { filters.push([`lte_${field}`, value]); return builder; },
		order(field, { ascending = true } = {}) { order = `${field}:${ascending ? 'asc' : 'desc'}`; return builder; },
		limit(value) { limit = value; return builder; },
		single() { single = true; return builder; },
		insert(value) { method = 'POST'; body = value; return builder; },
		update(value) { method = 'PATCH'; body = value; return builder; },
		delete() { method = 'DELETE'; return builder; },
		then(resolve, reject) {
			const params = new URLSearchParams(filters);
			if (order) params.set('order', order);
			if (limit) params.set('limit', String(limit));
			if (method !== 'GET' && filters.some(([key]) => key === 'id')) params.set('id', filters.find(([key]) => key === 'id')[1]);
			const run = request(`/data/${table}${params.toString() ? `?${params}` : ''}`, {
				method,
				...(method === 'POST' || method === 'PATCH' ? { body: JSON.stringify(body) } : {}),
			}).then((payload) => {
				const data = method === 'GET' || method === 'PATCH' ? (single ? payload.data?.[0] || null : payload.data || []) : (single ? payload.data?.[0] || null : payload.data || []);
				return { data, error: null, count: payload.count };
			}).catch((error) => ({ data: null, error, count: 0 }));
			return run.then(resolve, reject);
		},
	};
	return builder;
}

export const supabase = { auth, from: tableQuery };
