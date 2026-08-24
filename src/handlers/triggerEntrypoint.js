const SQS = require('aws-sdk/clients/sqs');
const { getExcludedAdaptors } = require('../utils/exclude');
const adaptorList = require('../adaptors/list');

module.exports.handler = async () => main();

// Start the pipeline by sending one message per adaptor to the adapter queue.
const main = async () => {
  console.log('Starting adapter pipeline');

  try {
    const sqs = new SQS();
    const excludedAdaptors = await getExcludedAdaptors();
    const adaptors = adaptorList.filter((adaptor) => !excludedAdaptors.has(adaptor));

    for (const adaptor of adaptors) {
      await sqs
        .sendMessage({
          QueueUrl: process.env.ADAPTER_QUEUE_URL,
          MessageBody: JSON.stringify({ adaptor }),
        })
        .promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ body: 'pipeline started' }),
    };
  } catch (error) {
    console.error('Failed to start adapter pipeline', { error });
    throw error;
  }
};
