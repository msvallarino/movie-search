import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Separator } from "@/components/ui/separator";
import MoviesContainer from "@/movies/MoviesContainer";
import { InputWithButton } from "@/movies/InputWithLabel";
import { MoviesProvider } from "@/context/MovieContext";
import { CacheCounter } from "@/movies/CacheCounter";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MoviesProvider>
      <InputWithButton />
      <Separator />
      <CacheCounter />
      <Separator />
      <MoviesContainer />
      <Component {...pageProps} />
    </MoviesProvider>
  );
}
