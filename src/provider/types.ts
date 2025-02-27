export type MakeRequestArg = {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
};

export type FetchBlacklistedRes = {
  reason: string | null;
};
