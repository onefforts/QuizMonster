// ProductionのFireStoreをCloud Storageにバックアップする
// Production以外では動作させない

const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const config = require('./config')
const projectId = process.env.GCLOUD_PROJECT
const bucket = config[projectId].BACKUP_BUCKET

// テスト環境はバックアップの期間を長めに
const backupPeriodHour = projectId === 'sangaku-prod' ? 24 : 2400

module.exports = functions.pubsub.schedule(`every ${backupPeriodHour} hours`).onRun((context) => {
  const databaseName = client.databasePath(process.env.GCP_PROJECT, '(default)');

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    // Leave collectionIds empty to export all collections
    // or set to a list of collection IDs to export,
    // collectionIds: ['users', 'posts']
    collectionIds: []
    })
  .then(responses => {
    const response = responses[0];
    console.log(`Operation Name: ${response['name']}`);
    return response;
  })
  .catch(err => {
    console.error(err);
    throw new Error('Export operation failed');
  });
});

