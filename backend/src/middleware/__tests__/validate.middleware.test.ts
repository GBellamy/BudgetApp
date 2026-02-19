import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../validate.middleware';

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

function createMocks(body: unknown) {
  const req = { body } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('validate middleware', () => {
  const middleware = validate(testSchema);

  it('should call next() on valid body', () => {
    const { req, res, next } = createMocks({ name: 'Alice', age: 30 });

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Alice', age: 30 });
  });

  it('should return 400 on invalid body', () => {
    const { req, res, next } = createMocks({ name: '', age: -1 });

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Données invalides',
        details: expect.arrayContaining([
          expect.objectContaining({ field: expect.any(String) }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 with missing required fields', () => {
    const { req, res, next } = createMocks({});

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const details = (res.json as jest.Mock).mock.calls[0][0].details;
    expect(details.length).toBeGreaterThanOrEqual(2);
  });
});
