export type GlobalOpts = {
  env?: string;
  json?: boolean;
  verbose?: boolean;
};

export function asGlobalOpts(opts: {
  env?: string;
  json?: boolean;
  verbose?: boolean;
}): GlobalOpts {
  return {
    env: opts.env,
    json: Boolean(opts.json),
    verbose: Boolean(opts.verbose),
  };
}
