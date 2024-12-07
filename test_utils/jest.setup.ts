import { RedisContainer } from '@testcontainers/redis';
import { StartedTestContainer } from 'testcontainers';

declare global {
  var __REDIS_CONTAINER__: StartedTestContainer;
}

const setup = async () => {
  const container = await new RedisContainer().withExposedPorts(6379).start();

  const redisPort = container.getMappedPort(6379);
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = redisPort.toString();

  global.__REDIS_CONTAINER__ = container;
};

export default setup;
