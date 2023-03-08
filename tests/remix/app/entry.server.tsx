import { webcrypto as crypto } from 'node:crypto';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { Response, type EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { NonceProvider, NonceContext } from './contexts/nonce';

/**
 * handleRequest is an example of how you might use Remix to render a response with a Nonce in a Node runtime..
 * @param request
 * @param responseStatusCode
 * @param responseHeaders
 * @param remixContext
 * @returns
 */
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let err = false;

    /** NOTE: We need to generate a nonce here. We are using webcrypto to generate a 128-bit nonce. **/
    const nonce = [...crypto.getRandomValues(new Uint8Array(16))]
      .map((m) => ('0' + m.toString(16)).slice(-2))
      .join('');

    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <RemixServer context={remixContext} url={request.url} />
      </NonceContext.Provider>,
      {
        onShellReady: () => {
          const body = new PassThrough();
          responseHeaders.set('Content-Type', 'text/html');
          /** NOTE: Set the nonce here **/
          responseHeaders.set(
            'Content-Security-Policy',
            `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`
          );
          const response = new Response(body, { headers: responseHeaders, status: err ? 500 : responseStatusCode })
          resolve(response);
          pipe(body);
        },
        onShellError: (err: unknown) => reject(err),
        onError: (error: unknown) => (err = true) && console.error(error),
        /** NOTE: We need pass the nonce here too for suspense **/
        nonce,
      }
    );
    setTimeout(abort, 5000);
  });
}

/**
 * NOTE: The following is working example for 'neutral' platforms like Deno or Cloudflare Workers/Pages.
 */
// import { type EntryContext } from '@remix-run/server-runtime';
// import { RemixServer } from '@remix-run/react';
// import { NonceProvider } from './contexts/nonce';
// import { renderToReadableStream } from 'react-dom/server';

// export default async function handleRequest(
//   request: Request,
//   responseStatusCode: number,
//   responseHeaders: Headers,
//   remixContext: EntryContext,
// ) {
//   const nonce = [...crypto.getRandomValues(new Uint8Array(16))].map((m) => ('0' + m.toString(16)).slice(-2)).join('');
//   const body = await renderToReadableStream(
//     <NonceProvider nonce={nonce}>
//       <RemixServer context={remixContext} url={request.url} />
//     </NonceProvider>,
//     {
//       onError: (error) => {
//         responseStatusCode = 500;
//         console.error(error);
//       },
//       signal: request.signal,
//       nonce,
//     },
//   );
//   const headers = new Headers(responseHeaders);
//   headers.set('Content-Type', 'text/html');
//   headers.set("Content-Security-Policy", `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`)
//   return new Response(body, {
//     status: responseStatusCode,
//     headers,
//   });
// }
