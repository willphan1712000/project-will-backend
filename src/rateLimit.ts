import dayjs from 'dayjs';
import { type NextFunction, type Request, type Response } from 'express';

/**
 * This function checks rate limit on each request. This should sit as a middleware function in the data pipeline for each request
 * - Config rate limit specifies the max number of requests a service has within a reset time
 * - Config reset time specifies the time window (seconds) when rate limit resets
 *
 * @param getDevice method that gets a device info
 * @param createDevice method that creates a device with given info
 * @param updateDevice method that updates a device with given info
 * @param config object { rateLimit: the number of requests you want to restrict per session, resetTime: the time window from the last request until it resets in seconds }
 *
 * @example
 * import { rateLimit } from '@willphan1712000/backend';
 * router.post('/route', [authMiddleware, rateLimit({ params })], controllerFunc);
 */
export default function rateLimit(
    getDevice: (
        id: string,
        ip: string | undefined
    ) => Promise<{ rate: number; date?: number | null } | undefined>,
    createDevice: (
        id: string,
        ip: string | undefined,
        rate: number,
        date?: number | null
    ) => Promise<{ rate: number; date?: number | null }>,
    updateDevice: (
        id: string,
        ip: string,
        rate: number,
        date?: number | null
    ) => Promise<void>,
    config: {
        rateLimit: number;
        resetTime: number;
    }
) {
    const error = 'You have passed our rate limit. Please try again later.';
    return async (req: Request, res: Response, next: NextFunction) => {
        const id = req.body.deviceId as string | undefined;
        if (!id)
            return res
                .status(400)
                .json({ success: false, error: 'There is no device id' });

        const ip = req.ip;
        const device = await getDevice(id, ip);

        if (!device) {
            await createDevice(id, ip ?? '127.0.0.1', 1, null);
            return next();
        }

        const { rate, date } = device;

        if (date && date !== 0) {
            if (dayjs().unix() - date >= config.resetTime) {
                await updateDevice(id, ip ?? '127.0.0.1', 1, null);
                return next();
            } else
                return res.status(429).json({
                    success: false,
                    error,
                });
        }

        if (rate < config.rateLimit) {
            await updateDevice(id, ip ?? '127.0.0.1', rate + 1, null);
        } else {
            await updateDevice(id, ip ?? '127.0.0.1', rate, dayjs().unix());
            return res.status(429).json({
                success: false,
                error,
            });
        }

        next();
    };
}
