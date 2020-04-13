# Swarm Scan
## A distributed DynamoDB parallel scanner

This repo is a one-size fits most solution for data extraction, transform, and load (ETL) tasks for data stored inside [AWS DynamoDB][2] tables with on-demand provisioning enabled*. If you have suggestions, feel free to open up an issue, or better yet, a pull request.

### Configuration and Usage
Usage is pretty simple, but requires a teeny bit of setup. Firstly, ensure you have the serverless package installed and configured for your deployment target. You can find everything you need here on their [installation documentation][1].

Second, make sure you have your AWS account number handy as it's required for url and arn construction. Set that to an environment variable `AWS_ACCOUNT_NUMBER`.

Third, update the defaults! There are is a reasonable default value for `limit`, and aws region is defaulted to `us-east-1`, but in serverless.yml there's a section for the launcher function that is set to trigger based on a timed task. You can create multiple entries in the `events` schedule section, each with a different table. You can (and probable should) set it up on a cron formatted time schedule, or base it on some other event.

Lastly, write your own function for scanner.js. This is a demo, more or less, and `doSomethingWithData` doesn't do diddly until you give it something to do.

Doing the thing:
```bash
serverless deploy [--stage][--limit][--region]
```
</br>

#### Command Line Options
| Flag | Type | Required | Description | Default |
|:-----|:----:|:--------:|:-----------:|--------:|
|--stage|string|false|the stage, or "environment" in which this will run, e.g. `staging`, `prod`|`development`|
|--limit|integer|false|the estimated maximum number of records for each scan worker to handle|1000|
|--region|string|false|the AWS Region to deploy this function|`us-east-1`|

</br>

### What it does
This is only a template for a serverless-deployed [AWS Lambda][3] application that will conduct a parallel scan on your chosen DynamoDB tables. There are two Lambda functions, the first, (launcher.js,) retrieves details about your table for a rough item count, divides that number by your configured `limit` option (approximate max number of items you would like each scan worker to read), and writes messages to SQS with configuration information for the scan workers. The second function, (scanner.js,) is the scan worker itself. It is configured in serverless.yml to recieve a single SQS message at a time, which contains information related to the scan operation.

DynamoDB allows for parallel scans by providing parameters for `TotalSegments` and (this, the current) `Segment` options. The actual number of records each worker will scan is determined by DynamoDB's api, and only loosely controlled by the `limit` option.

\* please note that there are still limitations as to how quickly DynamoDB can scale up read provisions, even with on-demand provisioning. You should test this before you let this thing go ham!

[1]: https://serverless.com/framework/docs/getting-started/
[2]: https://aws.amazon.com/dynamodb
[3]: https://aws.amazon.com/lambda
