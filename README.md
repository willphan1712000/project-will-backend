<img style="width: 15%" src="./will.png" alt="Will frontend package logo">

# `@willphan1712000/backend`
Package module for reusable Node.js utilities for building robust and maintainable backend infrastructure.

## Exports

- `rateLimit`

## `rateLimit`

Express middleware factory for device-based request limiting.

```ts
import { rateLimit } from '@willphan1712000/backend';
```

### Signature

```ts
rateLimit(getDevice, createDevice, updateDevice, {
  rateLimit: number,
  resetTime: number,
})
```

### Behavior
- If there are too many requests sent over this middleware, it is going to block until a time reset is hit, resulting in `429` `too many requests` error code
- After time reset period, users are able to send requests again

### Required persistence callbacks

```ts
type DeviceRecord = {
  rate: number;
  date?: number | null;
};
```

```ts
const middleware = rateLimit(
  async (id, ip): Promise<DeviceRecord | undefined> => {
    // Return the existing device record for this device/IP pair.
  },
  async (id, ip, rate, date): Promise<DeviceRecord> => {
    // Create a new device record.
    return { rate, date };
  },
  async (id, ip, rate, date): Promise<void> => {
    // Update the existing device record.
  },
  {
    rateLimit: 5,
    resetTime: 60,
  }
);
```

### Example

```ts
router.post(
  '/route',
  [
    authMiddleware,
    middleware,
  ],
  controllerFunc
);
```
