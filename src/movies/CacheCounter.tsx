import { useMovies } from '../context/MovieContext';

export function CacheCounter() {
  const { cacheCounter } = useMovies();

  return (
      <div className="mx-5 my-2"> Cache Counter: {cacheCounter}</div>
  );
}
