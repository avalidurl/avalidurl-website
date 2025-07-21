---
title: "Daily 6"
description: "Midnight edition UTC+3"
publishDate: 2023-06-22
author: "Gokhan Turhan"
tags: ["finance", "art", "technology", "crypto", "data"]
category: "finance"
featured: false
readingTime: 3
excerpt: "What a week. Although almost every market participant's and makers' foci shifted away from the tedium and ennui of the recession through which cryptomarkets has been painstakingly evolving, it would b..."
originalUrl: "https://gokhan.substack.com/p/daily-6"
---

What a week. Although almost every market participant's and makers' foci shifted away from the tedium and ennui of the recession through which cryptomarkets has been painstakingly evolving, it would be of the best interest for the reader to focus on the innovations and news at the protocol level.

We are all aware that SEC vs. Coinbase is literally meta-abstracting into an information exchange directly via Twitter whilst BinanceUS attorney are upset about the allegedly ambiguous stance and language by SEC at court.

Multiply those with Fed Chair Powell's testimony before the House Financial Services Committee where he is said to have uttered that they think the crypto is here to stay whilst don't perceive stablecoins as money.

A long, nice, and arduous Summer + Autumn Le Mans awaits us all.

## Protocol News

There is an Ethereum Research proposal to increase the maximum validator limit to 2048 ETH—which is to say that the minimum required amount stays at 32 ETH. You can read the [proposal here](https://ethresear.ch/t/increase-the-max-effective-balance-a-modest-proposal/15801). You can also read on the [security considerations](https://notes.ethereum.org/@fradamt/meb-increase-security#) here.

Regarding the above-mentioned proposal, some well-versed market participants sound that they do not really comprehend the difference between a full node, and a validator. We need to recall that a node can host any number of validators whereas not every node is a validator. Anthony Sassal [covered](https://www.youtube.com/watch?t=778&v=8jIdwjFIKmw&feature=youtu.be) the proposal on The Daily Gwei about two weeks ago when it was first proposed. You can always indulge in an ongoing debate around the proposal among renowned developers [here](https://twitter.com/0xgokhan/status/1670787828261826560?s=20).

There is a proposal for Polygon Labs (formerly Matic) to upgrade to a zkEVM validium rollup from their current Proof Of Stake model of an admixture of sidechain & layer2 architectures. When it comes to L2s, the most prominent types are optimistic rollups and validiums. The difference between the two are several crucial trade-offs. In terms of data availability, optimistic rollups directly post the data onchain on the Ethereum network whereas validiums handle the data offchain and the integrity thereof is dependent on the operators who approve the trueness thereof. When it comes to transaction validation, optimistic transactions are seen valid by default, and only verified if a challenge is cast whilst validiums use zkSNARK to prove correct the each transaction before included. While the former derives the security from directly the mainnet, validiums use a combination of Ethereum mainnet (to submit proofs) and validium operators to maintain offchain data. Here you can read [the proposal](https://forum.polygon.technology/t/pre-pip-discussion-upgrading-polygon-pos-to-a-zkevm-validium/12187).

Offchain Labs, the team behind the optimistic rollup Arbitrum layer2 blokchains Arbitrum One and Arbitrum Nova has released their much-anticipated product Arbitrum Orbis. Arbitrum Orbit is a tool that enables you to deploy and launch your own dedicated and self-managed Arbitrum rollup or AnyTrust blockchain that settles one of layer2s that they offer: Arbitrum One, Arbitrum Nova or the Arbitrum Görli testnet. You can manage permissions for your chain and choose your own gas token. [Read here](https://developer.arbitrum.io/launch-orbit-chain/orbit-gentle-introduction).

ZORA Network has launched their own layer2 solution Zora Network by means of Optimisim Bedrock stack. You can now bridge directly from the Ethereum mainnet to their novel chain. You can access all the [documentation here](https://support.zora.co/en/collections/4159737-zora-network) and the [network dashboard](https://bridge.zora.energy/) here.

Understanding the technical aspect of Aztec and their Noir language [LINK](https://hackmd.io/@erayack/SJfsQKM4n).

Mirror, a renowned crypto-media oriented creator suite known especially for their community resources editions and writing NFTs has announced inline minting options for any Ethereum NFT. Now, creators can paste and embed the URL to any nonfungibletokens into their text whereby anyone can directly mint it. [LINK](https://twitter.com/viamirror/status/1671951635961053191)

Farcaster protocol, a community steered sufficiently decentralized social applications protocol, are having series of improvement proposals (FIP) nowadays. Topics include flexible storage and ENS names. [LINK](https://warpcast.com/v/0xfc555d)