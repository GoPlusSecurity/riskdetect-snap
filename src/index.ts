import { OnRpcRequestHandler } from '@metamask/snaps-types';
import {
  panel,
  heading,
  text,
  divider,
  copyable,
  spinner,
} from '@metamask/snaps-ui';

import { assert, Hex } from '@metamask/utils';
import { Wallet } from 'ethers';
import { getPrivateKey } from './util';

/**
 * Get the current gas price using the `ethereum` global. This essentially the
 * same as the `window.ethereum` global, but does not have access to all
 * methods.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The current gas price as a hexadecimal string.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getAccounts() {
  const accounts = await ethereum.request<string[]>({
    method: 'eth_requestAccounts',
  });
  assert(accounts, 'Ethereum provider did not return accounts.');

  return accounts;
}

/**
 * Get the current network version using the `ethereum` global. This is
 * essentially the same as the `window.ethereum` global, but does not have
 * access to all methods.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The current network version as a string.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getVersion() {
  const version = await ethereum.request<string>({ method: 'net_version' });
  assert(version, 'Ethereum provider did not return a version.');

  return version;
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
              // divider(),
              // copyable('copyable content11'),
              // spinner(),
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
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param address - wallet address
 * @param _chainId - wallet address
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
async function getData(address: string, _chainId: string) {
  // const address = '0x5cF5e298FfaACa68A0257b352Be5EB9D9b51EDF5';
  // const response = await fetch(`https://gis-api.gopluslabs.io/api/v1/security/address/list/56?address=0x5cF5e298FfaACa68A0257b352Be5EB9D9b51EDF5&type=TOKEN`);
  const response = await fetch(`https://gis-api.gopluslabs.io/api/v1/security/address/list/${_chainId}?address=${address}&type=TOKEN`);
  return response.json();
}
