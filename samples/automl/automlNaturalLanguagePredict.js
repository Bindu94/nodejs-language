/**
 * Copyright 2018, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how to perform basic operations on dataset
 * with the Google AutoML Natural Language API.
 *
 * For more information, see the documentation at
 * https://cloud.google.com/natural-language/automl/docs/
 */

'use strict';

/* eslint node/no-extraneous-require: off */

/**
 * Classify the content.
 *
 * @param {string} projectId
 *   Id of the project.
 * @param {string} computeRegion
 *   Region name.
 * @param {string} modelId
 *   Id of the model which will be used for text classification.
 * @param {string} filePath
 *   Local text file path of the content to be classified.
 */
function predict(projectId, computeRegion, modelId, filePath) {
  // [START automl_natural_language_predict]
  const automl = require('@google-cloud/automl');
  const fs = require('fs');

  // Create client for prediction service.
  const client = new automl.v1beta1.PredictionServiceClient();

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Read the file content for prediction.
  const snippet = fs.readFileSync(filePath, 'utf8');

  // Set the payload by giving the content and type of the file.
  const payload = {
    textSnippet: {
      content: snippet,
      mimeType: 'text/plain',
    },
  };

  // params is additional domain-specific parameters.
  // currently there is no additional parameters supported.
  client
    .predict({name: modelFullId, payload: payload, params: {}})
    .then(responses => {
      console.log('Prediction results:');
      for (let result of responses[0].payload) {
        console.log('Predicted class name: ', result.displayName);
        console.log('Predicted class score: ', result.classification.score);
      }
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_predict]
}

require(`yargs`)
  .demand(1)
  .options({
    computeRegion: {
      alias: `c`,
      type: `string`,
      default: process.env.REGION_NAME,
      requiresArg: true,
      description: `region name e.g. "us-central1"`,
    },
    filePath: {
      alias: `f`,
      default: `./resources/test.txt`,
      type: `string`,
      requiresArg: true,
      description: `local text file path of the content to be classified`,
    },
    modelId: {
      alias: `i`,
      //default: ``,
      type: `string`,
      requiresArg: true,
      description: `Id of the model which will be used for text classification`,
    },
    projectId: {
      alias: `z`,
      type: `number`,
      default: process.env.PROJECT_ID,
      requiresArg: true,
      description: `The Project ID to use. Defaults to the value of the GCLOUD_PROJECTID`,
    },
    scoreThreshold: {
      alias: `s`,
      type: `string`,
      default: `0.5`,
      requiresArg: true,
      description:
        `A value from 0.0 to 1.0.  When the model makes predictions for an image it will` +
        `only produce results that have at least this confidence score threshold.  Default is .5`,
    },
  })
  .command(`predict`, `classify the content`, {}, opts =>
    predict(
      opts.projectId,
      opts.computeRegion,
      opts.modelId,
      opts.filePath,
      opts.scoreThreshold
    )
  )
  .example(`node $0 predict -i "modelId" -f "./resources/test.txt" -s "0.5"`)
  .wrap(120)
  .recommendCommands()
  .help()
  .strict().argv;
