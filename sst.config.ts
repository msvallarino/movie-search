import { SSTConfig } from "sst";
import { NextjsSite, Table } from "sst/constructs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import {
  ResponseHeadersPolicy,
  // CachePolicy,
  // CacheQueryStringBehavior,
  // CacheHeaderBehavior,
  // CacheCookieBehavior,
} from "aws-cdk-lib/aws-cloudfront";

export default {
  config(_input) {
    return {
      name: "movies-search",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // IDEAL CACHE SOLUTION. This can be tweak to more specific setup depending on requirements. 
      // const serverCachePolicy = new CachePolicy(stack, "ServerCache", NextjsSite.buildDefaultServerCachePolicyProps());

      const table = new Table(stack, "Movies", {
        fields: {
          queryString: "string",
          timestamp: "number",
          cacheCounter: "number",
        },
        primaryIndex: { partitionKey: "queryString" },
      });

      const site = new NextjsSite(stack, "MoviesApp", {
        path: ".",
        timeout: "30 seconds",
        memorySize: "256 MB",
        cdk: {
          responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
          // serverCachePolicy, // IDEAL CACHE SOLUTION
          server: {
            logRetention: RetentionDays.ONE_MONTH,
          },
        },
        environment:{
          DYNAMODB_TABLE: table.tableName,
          MOVIE_DB_API_KEY: process.env.MOVIE_DB_API_KEY!
        },
        permissions: ["dynamodb"]
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
