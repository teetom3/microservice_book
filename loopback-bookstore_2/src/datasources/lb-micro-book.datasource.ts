import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'LbMicroBook',
  connector: 'mongodb',
  url: '',
  host: process.env.MONGODB_HOST ?? '127.0.0.1',
  port: +(process.env.MONGODB_PORT ?? 27017),
  user: '',
  password: '',
  database: process.env.MONGODB_DATABASE ?? 'LbMicroBook',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class LbMicroBookDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'LbMicroBook';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.LbMicroBook', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
