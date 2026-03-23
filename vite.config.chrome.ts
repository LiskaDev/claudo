import { resolve } from 'path';
import { mergeConfig, defineConfig } from 'vite';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import baseConfig, { baseManifest, baseBuildOptions } from './vite.config.base'

const outDir = resolve(__dirname, 'dist_chrome');

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [
      crx({
        manifest: {
          ...baseManifest,
          background: {
            service_worker: 'src/pages/background/index.ts',
            type: 'module'
          },
        } as ManifestV3Export,
        browser: 'chrome',
        contentScripts: {
          injectCss: false,
        }
      }),
      {
        name: 'scope-tailwind-vars',
        enforce: 'post',
        generateBundle(_, bundle) {
          for (const key in bundle) {
            if (key.endsWith('.css') && bundle[key].type === 'asset') {
              const asset = bundle[key] as any;
              let css = asset.source.toString();
              // Prevent Tailwind v4 from globally initializing --tw- variables on the entire page
              css = css.replace(
                /\*,\s*:before,\s*:after,\s*::backdrop\s*\{/g,
                '#__root *, #__root :before, #__root :after, #__root ::backdrop {'
              );
              asset.source = css;
            }
          }
        }
      }
    ],
    build: {
      ...baseBuildOptions,
      outDir
    },
  })
)