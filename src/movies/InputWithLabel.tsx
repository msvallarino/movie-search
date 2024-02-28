import { useEffect, useState } from "react";
import { useMovies } from '../context/MovieContext';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function InputWithButton() {
  const { setActivePage, setSearchQuery, fetchMovies } = useMovies();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue.length > 3) {
        setSearchQuery(inputValue);
        setActivePage(1);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [inputValue]);

  const handleSearch = () => {
    fetchMovies()
  };

  return (
    <div className="flex w-full my-2 items-end">
      <div className="w-3/4 mx-2">
        <Label htmlFor="movie-title" className="text-left">
          Search by Movie Titles
        </Label>
        <Input type="search" id="movie-title" placeholder="Movie Title" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      </div>
      <Button type="button" className="w-1/4 mx-2" onClick={(e) => handleSearch()}>
        Search
      </Button>
    </div>
  );
}
