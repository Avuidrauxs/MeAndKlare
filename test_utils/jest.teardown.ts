const teardown = async () => {
  await global.__REDIS_CONTAINER__.stop();
};

export default teardown;
