import type { MetaFunction, HeadersFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import { NonceContext } from './contexts/nonce';
import { Partytown } from '@builder.io/partytown/react';
import { useContext } from 'react';


export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

export const headers: HeadersFunction = () => {
  return {
    /**
     * NOTE: Using 'require-corp' for Safari Atomics support
     * See: https://partytown.builder.io/atomics#setting-cross-origin-attribute
     **/
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
};

export default function App() {
  /** NOTE: The nonce will be undefined during the initial render pass **/
  const nonce = useContext(NonceContext);

  return (
    <html lang="en">
      <head>
        <Partytown debug={true} scriptProps={{ nonce:nonce }} />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        {/**NOTE: PR to undeprecate https://github.com/remix-run/remix/pull/5161 */}
        <LiveReload nonce={nonce} />

        <p id="script-with-nonce" suppressHydrationWarning />

        <p id="script-without-nonce">passed</p>

        <p id="">passed</p>
        {/**NOTE: If this runs, the CSP has failed*/}
        <script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('script-without-nonce').textContent = 'failed';
            `,
          }}
        />

        <script
          type="text/partytown"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              document.getElementById('script-with-nonce').textContent = 'passed';
              document.body.classList.add('completed');
            `,
          }}
        />
      </body>
    </html>
  );
}
