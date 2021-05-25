export function sleep(ms: number): Promise<void> {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

export const randomBoolean = () => Math.random() <= 0.5;
