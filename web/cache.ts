import localForage from 'localforage'

type CacheEntry<A> = {
	ttl: number
	item: A
}

const refreshItem = async <A>(
	key: string,
	fn: (...args: any[]) => Promise<A>,
	args: any[],
	lifeTimeInMinutes: number,
): Promise<A> => {
	const item = await fn(...args)
	await localForage.setItem(key, {
		ttl: Date.now() + lifeTimeInMinutes * 60 * 1000,
		item,
	})
	return item
}

/**
 * Generic cache wrapper
 */
export const cache = <A>(
	fn: (...args: any[]) => Promise<A>,
	lifeTimeInMinutes = 5,
): ((...args: any[]) => Promise<A>) => async (...args: any[]) => {
	const key = btoa(`${fn.toString()}|${JSON.stringify(args)}`)
	const entry = await localForage.getItem<CacheEntry<A>>(key)
	if (entry === null) {
		console.debug('Cache', `Cache entry is null for ${key}`)
		return refreshItem(key, fn, args, lifeTimeInMinutes)
	}
	console.debug(
		'Cache',
		`Hit for ${key}`,
		entry.item,
		`TTL: ${Math.round((entry.ttl - Date.now()) / 1000 / 60)} min`,
	)
	if (entry.ttl > Date.now()) return entry.item
	return refreshItem(key, fn, args, lifeTimeInMinutes)
}
