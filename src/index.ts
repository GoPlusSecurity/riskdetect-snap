import { OnRpcRequestHandler } from '@metamask/snaps-types';
import {
  panel,
  heading,
  text,
} from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';

/**
 * Get the Ethereum accounts that the snap has access to using the `ethereum`
 * global. This is essentially the same as the `window.ethereum` global, but
 * does not have access to all methods.
 *
 * If the user hasn't given the snap access to any accounts yet, this JSON-RPC
 * method will show a prompt to the user, asking them to select the accounts to
 * give the snap access to.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The selected accounts as an array of hexadecimal strings.
 * @throws If the user rejects the prompt.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getAccounts() {
  const accounts = await ethereum.request<string[]>({
    method: 'eth_requestAccounts',
  });
  assert(accounts, 'Ethereum provider did not return accounts.');

  return accounts as string[];
}

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
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  let { chainId } = request.params;
  switch (request.method) {
    case 'token_detection':
      return getAccounts().then(async (accounts) => {
        if (!accounts.length) {
          throw new Error('Get the Ethereum accounts Fail.');
        }
        const res = await getData(accounts[0], chainId);
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
        } else {
          throw new Error(res.message);
        }

        if (panelArr.length === 0) {
          panelArr.push(text('No data'));
        }

        snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              heading(`Risk Detect by ${origin}`),
              text(`Hello, ${accounts[0]}`),
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
