import { Movie } from "@/types/Movie";

export type CachedMoviesRecord= {
	queryString: string,
	timestamp: number,
	cacheCounter: number,
	totalPages: number,
	hits: Movie[],
}

export interface IMovieRepository {
	findById: (queryString: string) => Promise<CachedMoviesRecord | undefined>;
	create: (cacheRecord: CachedMoviesRecord) => Promise<CachedMoviesRecord>
	incrementCacheCounter: (queryString: string) => Promise<CachedMoviesRecord>
}
