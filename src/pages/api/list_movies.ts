import { CachedMoviesRecord } from '@/data-access/interface';
import { MoviesRepository } from '@/data-access/repository';
import { Movie } from '@/types/Movie';
import { GetMovieResponse } from '@/types/TheMovieDB';
import { Logger } from '@aws-lambda-powertools/logger';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const logger = new Logger({ serviceName: process.env.SST_APP, logLevel: 'DEBUG', });
const moviesRepository = MoviesRepository(logger);

// TODO: For bigger projects this may need to be moved to its own Service
const callTheMovieDbAPI = async (query: string, pageNumber: string = '1'): Promise<GetMovieResponse> => {
  try {
    logger.debug('Calling callTheMovieDbAPI with query params', { query, pageNumber })

    const { data }: { data: GetMovieResponse} = await axios({
      method: 'get',
      url: `https://api.themoviedb.org/3/search/movie?query=${query}&page=${pageNumber}`,
      headers: {
        'Authorization': `Bearer ${process.env.MOVIE_DB_API_KEY}`,
      },
    });
    logger.debug('Response from callTheMovieDbAPI', { data })

    // Data will always have a body response even when there is no hits (total_results=0)
    return data
  } catch (error) {
    logger.error('Failed to call callTheMovieDbAPI', { error })
    throw error
  }
}

// Ideally this should live under utils or other helper folder
const recordIsFresh = (recordTimestamp: number) => {
  const now = Date.now();
  const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
  return now - recordTimestamp < twoMinutes;
};

// Utility function to wait for a specified time
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    logger.debug('Lambda function invoked, Request Query', { query: req.query })
    
    const query = req.query.query;
    // Check if queryString is an array or undefined, and ensure it's treated as a string.
    if (Array.isArray(query) || typeof query === 'undefined') {
      res.status(400).send("Invalid or missing 'query' query parameter");
      return;
    }

    let pageNumber = req.query.pageNumber; // Optional
    // Check if queryString is an array or undefined, and ensure it's treated as a string.
    if (Array.isArray(pageNumber)) {
      res.status(400).send("Invalid 'pageNumber' query parameter");
      return;
    }

    logger.info('Starting to wait');
    await sleep(3000); // Wait for 10 seconds
    logger.info('Finished waiting');

    // We consider 'queryString' as a concatenation of Query and Page
    const queryString = `${pageNumber}_${pageNumber}` 

    // 1. First checks if the cache record exist in DynamoDB. If it does compare the timestamp to see if its older than 2 minutes. If all is true return cache 
    const moviesFromCache = await moviesRepository.findById(queryString)
    if (moviesFromCache && recordIsFresh(moviesFromCache.timestamp)){
      // Increment Cache Counter
      const updatedCache = await moviesRepository.incrementCacheCounter(moviesFromCache.queryString)
      res.status(200).json(updatedCache);
      return;
    }
    
    // 2. Calls to TheMovieDBAPI to fetch movies
    try {
      const moviesFromApi = await callTheMovieDbAPI(query, pageNumber)

      if (moviesFromApi.total_results === 0) res.status(404).send("There are no results with given criteria");

      // Transform the response to how we need to save it, ideally we would use Zod Validators and a Movie Service for more complex flows
      const sanitizeAPIData = moviesFromApi?.results.map(movieData =>{
        const movieInfo: Movie = {
          id: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          original_title: movieData.original_title,
          popularity: movieData.vote_average,
          release_date: movieData.release_date,
          poster_path: movieData.poster_path || 'NO_DATA',
        }
        return movieInfo
      })

      const newCacheRecord: CachedMoviesRecord = {
        queryString: queryString,
        timestamp: Date.now(),
        cacheCounter: 0,
        totalPages: moviesFromApi.total_pages,
        hits: sanitizeAPIData
      }

      const createdCacheRecord = await moviesRepository.create(newCacheRecord)
      res.status(200).json(createdCacheRecord);
      return;

    } catch (error) {
      res.status(503).send("The Movie DB API is not available");
      return;
    }

  } catch (error) {
    logger.error('Unexpected error', { error })
    res.status(500).end("Something went wrong");
  }
}
