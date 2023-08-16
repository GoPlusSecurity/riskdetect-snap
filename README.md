# @goplus/riskdetect-snap

A MetaMask Snap that can detect risks of user assets, supported by GoPlusSecurity.

This repository demonstrates how to develop a snap with TypeScript. For detailed instructions, see [the MetaMask documentation](https://docs.metamask.io/guide/snaps.html#serving-a-snap-to-your-local-environment).

MetaMask Snaps is a system that allows anyone to safely expand the capabilities of MetaMask. A snap is a program that we run in an isolated environment that can customize the wallet experience.

## Snaps is pre-release software

To interact with (your) Snaps, you will need to install [MetaMask Flask](https://metamask.io/flask/), a canary distribution for developers that provides access to upcoming features.

## Usage mode

### Example 


```
type GetSnapsResponse = Record<string, Snap>;

type Snap = {
    permissionName: string;
    id: string;
    version: string;
    initialPermissions: Record<string, unknown>;
};


/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
    return (await window.ethereum.request({
        method: 'wallet_getSnaps',
    })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
    snapId: string = defaultSnapOrigin,
    params: Record<'version' | string, unknown> = {},
) => {
    await window.ethereum.request({
        method: 'wallet_requestSnaps',
        params: {
            [snapId]: params,
        },
    });
};


/**
 * Invoke the "token_detection" method from the snap.
 */
export const getTokenDetetion = async (chainId) => {
    await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
            snapId: 'npm:@goplus/riskdetect-snap',
            request: {
                method: 'token_detection',
                params: {
                    chainId,
                },
            },
        },
    });
};
```


## Notes

- Babel is used for transpiling TypeScript to JavaScript, so when building with the CLI,
  `transpilationMode` must be set to `localOnly` (default) or `localAndDeps`.
