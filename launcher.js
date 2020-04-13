'use strict';

const SQS = require('aws-sdk/clients/sqs');
const DynamoDB = require('aws-sdk/clients/dynamodb');

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL
const MAX_ITEMS_PER_WORKER = process.env.MAX_ITEMS_PER_WORKER || 1000;

const dbOptions = {
  region: 'us-east-1'
}

const sqs = new SQS();
const dynamo = new DynamoDB(dbOptions);

module.exports.handler = async (event) => {
  console.log('EVENT START', event);
  const params = {
    TableName: event.table
  };

  try {
    const data = await dynamo.describeTable(params).promise();
    const totalItems = data.Table.ItemCount;
    const segments = Math.max(Math.floor(totalItems / MAX_ITEMS_PER_WORKER), 1);

    const messages = await Promise.all(Array.from(Array(segments)).map((_, i) => {
      const message = {
        MessageBody: JSON.stringify({
          Segment: i,
          TotalSegments: segments,
          TableName: event.table,
        }),
        QueueUrl: SQS_QUEUE_URL,
      };
      return sqs.sendMessage(message).promise();
    }));
    console.log(`[LAUNCHER SUCCESS] - created ${segments} messages for table ${event.table}`);
    return { statusCode: 200 };
  } catch (error) {
    console.error(`[LAUNCHER ERROR] - an error occurred: ${error}`)
    return { statusCode: 500 };
  }
};
