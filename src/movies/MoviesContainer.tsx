import React, { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MovieCard } from "./MovieCard";
import { useMovies } from '../context/MovieContext';
import { MovieSkeleton } from "./MovieSkeleton";


const ResponsiveCardContainer = () => {
  const { movies, totalPages, loading, activePage, setActivePage } = useMovies();
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 20;
  const [endIndex, setEndIndex] = useState(itemsPerPage);
  const needsPagination = totalPages > 1 // For when the movies.length != 20 --> movies.length > itemsPerPage;
  const maxPageNumbersToShow = 8;

  // Calculate the range of pages to display
  let startPage = Math.max(activePage - Math.floor(maxPageNumbersToShow / 2), 1);
  let endPage = Math.min(startPage + maxPageNumbersToShow - 1, totalPages);

  // Adjust startPage if we're at the last pages and can't fill the pagination slots
  if (endPage - startPage + 1 < maxPageNumbersToShow) {
    startPage = Math.max(endPage - maxPageNumbersToShow + 1, 1);
  }

  const changePage = (newPage: number) => {
    setActivePage(newPage);
  };
  /**
   * We have only 20 items per page from TheMovieDB API, that coincides with our itemsPerPage, therefore we 'trust' the items returned by the API
   * and get the totalPages from it too.
   */
  // const totalPages = Math.ceil(movies.length / itemsPerPage);

  return (
    <div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {loading
        ? Array.from({ length: 10 }).map((_, index) => <MovieSkeleton key={index} />)
        : movies.slice(startIndex, endIndex).map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </div>
      {needsPagination && (
        <Pagination className="mt-5">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className={activePage === 1 ? "pointer-events-none opacity-50" : ""}
                onClick={() => changePage(activePage - 1)}
              />
            </PaginationItem>

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNumber => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === activePage}
                  onClick={(e) => {
                    e.preventDefault();
                    changePage(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                className={activePage === totalPages ? "pointer-events-none opacity-50" : ""}
                onClick={() => changePage(activePage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
export default ResponsiveCardContainer;
