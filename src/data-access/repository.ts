import { Logger } from "@aws-lambda-powertools/logger";
import {
  type DynamoDBDocumentClient,
  GetCommand,
  type GetCommandInput,
  PutCommand,
  type PutCommandInput,
  UpdateCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { CachedMoviesRecord, IMovieRepository } from "./interface";
import { dynamoDBClient as client } from "./dynamoDBClient";

export const TABLE_NAME = process.env.DYNAMODB_TABLE;
export function MoviesRepository(
  logger: Logger,
  dynamoDBClient: DynamoDBDocumentClient = client
): IMovieRepository {
  /**
   *
   * @param queryString
   * @returns CachedMoviesRecord | undefined
   */
  const findById = async (
    queryString: string
  ): Promise<CachedMoviesRecord | undefined> => {
    const params: GetCommandInput = {
      TableName: TABLE_NAME,
      Key: {
        queryString,
      },
    };
    logger.debug("MovieRepository.findById :: GetCommandInput", { params });

    const queryResult = await dynamoDBClient.send(new GetCommand(params));
    logger.debug("MovieRepository.findById :: GetCommandOutput", {
      queryResult,
    });

    if (queryResult.Item != null) {
      return queryResult.Item as CachedMoviesRecord;
    }

    return undefined;
  };

  /**
   * We are using DynamoDB atomic counter for increasing the cache value, there are other more precise strategies.
   * Check https://aws.amazon.com/blogs/database/implement-resource-counters-with-amazon-dynamodb
   * @param cacheRecord
   * @returns CachedMoviesRecord
   */
  const create = async (
    cacheRecord: CachedMoviesRecord
  ): Promise<CachedMoviesRecord> => {
    const params: PutCommandInput = {
      TableName: TABLE_NAME,
      Item: cacheRecord,
    };
    logger.debug("MovieRepository.create :: PutCommandInput", { params });

    const result = await dynamoDBClient.send(new PutCommand(params));
    logger.debug("MovieRepository.create :: PutCommandOutput", { result });

    return cacheRecord;
  };

  /**
   * Increment cacheCounter using DynamoDB atomic counter.
   * @param cacheRecordId The ID of the cache record to update.
   * @returns Promise<void>
   */
  const incrementCacheCounter = async (
    queryString: string
  ): Promise<CachedMoviesRecord> => {
    const params: UpdateCommandInput = {
      TableName: TABLE_NAME,
      Key: {
        queryString,
      },
      UpdateExpression: "SET cacheCounter = cacheCounter + :inc", // Increment cacheCounter
      ExpressionAttributeValues: {
        ":inc": 1, // Increment by 1
      },
      ReturnValues: "ALL_NEW", // Return the new value of cacheCounter
    };

    logger.debug("incrementCacheCounter :: UpdateCommandInput", { params });

    const result = await dynamoDBClient.send(new UpdateCommand(params));
    logger.debug("incrementCacheCounter :: UpdateCommandOutput", { result });

    return result.Attributes as CachedMoviesRecord;
  };

  // Future improvements, adding High Order functions to catch and log errors
  return {
    findById,
    create,
    incrementCacheCounter,
  };
}
