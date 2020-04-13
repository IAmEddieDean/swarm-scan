'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');

const dbOptions = {
  region: 'us-east-1'
}
const dynamo = new DynamoDB(dbOptions);
const documentClient = new DynamoDB.DocumentClient({ service: dynamo });

module.exports.handler = async (event) => {
  const [sqsEvent] = event.Records;
  const params = JSON.parse(sqsEvent.body);
  console.log('SCAN STARTING', params);

  let counter = 0;
  let ExclusiveStartKey;
  try {
    do {
      const { Items, LastEvaluatedKey } = await documentClient.scan(params).promise();
      await doSomethingWithData(Items);

      counter += Items.length;
      ExclusiveStartKey = LastEvaluatedKey || false;
      params.ExclusiveStartKey = ExclusiveStartKey;

    } while (ExclusiveStartKey);
  } catch (error) {
    console.error(`[SCANNER ERROR] - scanner segment ${params.Segment} encountered an error on table ${params.TableName}`, error);
    return { statusCode: 500 };
  }

  console.log(`[SCANNER SUCCESS] - scanner segment ${params.Segment} successfully scanned ${counter} items from ${params.TableName}`);
  return { statusCode: 200 };
}


async function doSomethingWithData(data) {
  return true;
}
