/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Movie } from "@/types/Movie";

interface MovieCardProps extends React.ComponentProps<typeof Card> {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className, ...props }: MovieCardProps) {
  const movieLink = `https://www.themoviedb.org/movie/${movie.id}`;

  return (
    <Card
      className={`flex flex-col h-500 max-w-xs md:max-w-sm lg:max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
      {...props}
    >
      <img
        className="w-full h-auto"
        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
        alt={`Poster of ${movie.original_title}`}
      />
      <CardContent className="flex flex-col flex-grow p-2">
        <div className="bg-white flex-grow">
          <CardTitle className="text-lg font-bold mb-2">
            {movie.title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mb-4">
            {movie.release_date}
          </CardDescription>
          <div className="flex flex-col justify-between flex-grow">
            <div className="text-xl mb-2">
              Original Title:{movie.original_title}
              <span className="font-semibold">{movie.original_title}</span>
            </div>
            <ScrollArea className="rounded-md border flex-grow">{movie.overview}</ScrollArea>
            <Badge className="mt-5 bg-blue-500 text-white py-1 px-3 rounded-full text-xs self-start">
              Popularity: {movie.popularity}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-2 bg-gray-100">
        <a
          href={movieLink}
          className="text-blue-500 hover:text-blue-600 transition-colors duration-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          More info
        </a>
      </CardFooter>
    </Card>
  );
}
