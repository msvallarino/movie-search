import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { Movie } from "@/types/Movie";
import { CachedMoviesRecord } from "@/data-access/interface";

interface MovieContextType {
  movies: Movie[];
  setSearchQuery: (query: string) => void;
  fetchMovies: () => void;
  cacheCounter: number;
  totalPages: number;
  loading: boolean;
  activePage: number;
  setActivePage: (pageNumber: number) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error("useMovies must be used within a MoviesProvider");
  }
  return context;
};

interface MoviesProviderProps {
  children: ReactNode;
}

export const MoviesProvider: React.FC<MoviesProviderProps> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cacheCounter, setCacheCounter] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(1);

  const fetchMovies = useCallback(async () => {
    // Avoid calling the service when there is no searchQuery
    if (searchQuery === "") return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/list_movies?query=${searchQuery}&pageNumber=${activePage}`
      );

      // Check if the fetch request was successful
      if (!response.ok) {
        // Log the error with the response status
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: CachedMoviesRecord = await response.json();
      setMovies(data.hits);
      setCacheCounter(data.cacheCounter);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      // TODO: This should trigger a Toast with the error notification
      console.error((error as Error).message);
    }
  }, [searchQuery, activePage]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return (
    <MovieContext.Provider
      value={{
        movies,
        setSearchQuery,
        fetchMovies,
        cacheCounter,
        totalPages,
        loading,
        activePage,
        setActivePage,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
