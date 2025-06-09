// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [react()],

  env: {
    schema: {
      EMAIL_PASSWORD: envField.string({ 
        context: "server", 
        access: "secret" 
      }),
      SMTP_HOST: envField.string({ 
        context: "server", 
        access: "secret" 
      }),
      SMTP_USER: envField.string({ 
        context: "server", 
        access: "secret" 
      }),
      EMAIL_FROM: envField.string({ 
        context: "server", 
        access: "secret" 
      }),
      EMAIL_TO_LIST: envField.string({ 
        context: "server", 
        access: "secret" 
      }),
      COMPANY_PHONE: envField.string({ 
        context: "client", 
        access: "public" 
      }),
      COMPANY_EMAIL: envField.string({ 
        context: "client", 
        access: "public" 
      }),
      COMPANY_ADDRESS: envField.string({ 
        context: "client", 
        access: "public" 
      })
    }
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});