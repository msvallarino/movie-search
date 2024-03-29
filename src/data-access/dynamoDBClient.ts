import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const { REGION } = process.env;

const marshallOptions = {
	// Whether to automatically convert empty strings, blobs, and sets to 'null'.
	convertEmptyValues: false, // false, by default.
	// Whether to remove undefined values while marshalling.
	removeUndefinedValues: false, // false, by default.
	// Whether to convert typeof object to map attribute.
	convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
	// Whether to return numbers as a string instead of converting them to native JavaScript numbers.
	wrapNumbers: false, // false, by default.
};

const options = { region: process.env.CACHE_BUCKET_REGION };
const client = new DynamoDBClient(options)

export const dynamoDBClient = DynamoDBDocumentClient.from(client, {
	marshallOptions,
	unmarshallOptions,
});