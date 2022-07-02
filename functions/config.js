const config = {
  //開発
  'sangaku-dev': {
    ALGOLIA_ID: 'QPL1G7G4UE',
    ENVIRONMENT: 'development',
    SITE_URL: 'https://dev-quizhub.web.app',
    BACKUP_BUCKET: 'gs://sangaku-dev-backup-asia'
  },
  //本番
  'sangaku-prod':{
    ALGOLIA_ID: 'QPL1G7G4UE',
    ENVIRONMENT: 'production',
    SITE_URL: 'https://quizhub.info',
    BACKUP_BUCKET: 'gs://sangaku-prod-backup-asia'
  }

  // 機密情報が必要な場合はfirebaseのfunctions:configに入れる
  // see: https://firebase.google.com/docs/functions/config-env?hl=ja
}

module.exports = config;
