import { OnRpcRequestHandler } from '@metamask/snaps-types';
import {
  panel,
  heading,
  text,
} from '@metamask/snaps-ui';


/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ request }) => {
  const { address, chainId } = request.params;
  console.log(request.method);
  switch (request.method) {
    case 'token_detection':
      return getData(address, chainId).then(async (res) => {
        const panelArr: any = [];
        if (res.code === 1) {
          res.result.forEach((item: any) => {
            let icon = '';
            if (item.risky === 0 && item.attention === 0) {
              icon = '😄';
            } else if (item.risky > 0) {
              icon = '😱';
            } else if (item.risky === 0 && item.attention > 0) {
              icon = '😳';
            }

            panelArr.push(
              text(
                `${item.name}${icon}: ${item.risky} risky, ${item.attention} attention`,
              ),
            );
          });
        }

        if (panelArr.length === 0) {
          panelArr.push(text('No data'));
        }

        snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              heading(`Assets Health Detection`),
              text(`Hello, ${address}`),
              ...panelArr,
            ]),
          },
        });
      });
    default:
      throw new Error('Method not found.');
  }
};

/**
 * Request Data
 *
 * @param address - wallet address
 * @param _chainId - chain id
 * @returns Array.
 */
async function getData(address: string, _chainId: string) {
  const response = await fetch(`https://gis-api.gopluslabs.io/api/v1/security/address/list/${_chainId}?address=${address}&type=TOKEN`);
  return response.json();
}
