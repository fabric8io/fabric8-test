export const seconds = (n: number) => n * 1000;
export const minutes = (n: number) => n * seconds(60);

export const DEFAULT_WAIT_PAGE_LOAD = seconds(10);
export const DEFAULT_WAIT = seconds(60);
export const LONG_WAIT = minutes(1);
export const LONGER_WAIT = minutes(10);
export const LONGEST_WAIT = minutes(30);
