import type { RequestHandler } from 'express';
import { v7 as uuidv7 } from 'uuid';

const HEADER = 'x-request-id';

// Accept inbound IDs from upstream proxies/clients only if they look reasonable.
const INBOUND_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header(HEADER);

  const id =
    incoming !== undefined && INBOUND_PATTERN.test(incoming)
      ? incoming
      : uuidv7();

  req.id = id;
  res.setHeader(HEADER, id);

  next();
};