const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const isContainer = Boolean(process.env.CONTAINER) || Boolean(process.env.KUBERNETES_SERVICE_HOST);
const target = process.env.RUNTIME_TARGET || (isLambda ? 'lambda' : isContainer ? 'container' : 'node');

export const runtime = {
  target,
  isLambda,
  isContainer,
  isNode: !isLambda && !isContainer,
};

export const shouldAutoStartServer = () => {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  if (runtime.isLambda) {
    return false;
  }
  if (process.env.DISABLE_SERVER_AUTOSTART === 'true') {
    return false;
  }
  return true;
};

export default runtime;
