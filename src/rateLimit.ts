import dayjs from 'dayjs';
import { type NextFunction, type Request, type Response } from 'express';

/**
 * This function checks rate limit on each request. This should sit as a middleware function in the data pipeline for each request
 * - Config rate limit specifies the max number of requests a service has within a reset time
 * - Config reset time specifies the time window (seconds) when rate limit resets
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
    updateRequest: (
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
    return async (req: Request, res: Response, next: NextFunction) => {
        const id = req.body.deviceId as string | undefined;
        if (!id)
            return res
                .status(400)
                .json({ success: false, error: 'There is no device id' });

        const ip = req.ip;
        const device = await getDevice(id, ip);

        if (!device) return await createDevice(id, ip ?? '127.0.0.1', 1, null);

        const { rate, date } = device;

        if (date) {
            if (dayjs().diff(date, 'second') >= config.resetTime)
                await updateRequest(id, ip ?? '127.0.0.1', 0, null);
            else
                return res.status(400).json({
                    success: false,
                    error:
                        'You have passed our rate limit which is ' +
                        rateLimit +
                        ' requests. Try again later.',
                });
        }

        if (rate > config.rateLimit) {
            await updateRequest(id, ip ?? '127.0.0.1', rate, dayjs().unix());
            return res.status(400).json({
                success: false,
                error:
                    'You have passed our rate limit which is ' +
                    rateLimit +
                    ' requests. Try again later.',
            });
        }

        next();
    };
}
