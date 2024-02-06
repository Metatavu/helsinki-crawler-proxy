import { NextFunction, Request, Response } from 'express';
import { IncomingMessage } from 'http';

export const modifyResponseBodyAddElasticName = (req: Request, res: Response) => {
  const _write: Function = res.write;
  res.write = (data: any): boolean => {
    const modifiedData: string = data.toString().replace(
      'class="value"',
      'class="value" data-elastic-name="price"'
    );
    return _write.call(res, modifiedData);
  };

  return res;
};

export const modifyResponseHeaders = (proxyRes: IncomingMessage, req: Request, res: Response) => {
  console.log("Proxy res is ", proxyRes);

  // Identify documents requiring custom schema parameters in the response payload
  const requiresCustomSchema = /* Add your logic to identify documents */true;

  // If the document requires custom schema parameters, modify the response payload
  if (requiresCustomSchema) {
    // Add custom schema parameters to the response headers or body
    res.setHeader('X-Custom-Param', 'value');
  }
};