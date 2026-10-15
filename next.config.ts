import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
  experimental: {
    // generates `messages/ru.d.json.ts` so icu arguments and tags are type-checked
    createMessagesDeclaration: "./messages/ru.json",
  },
});

const nextConfig: NextConfig = {
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
};

export default withNextIntl(nextConfig);
