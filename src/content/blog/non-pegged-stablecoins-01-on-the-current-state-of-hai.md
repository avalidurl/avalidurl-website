---
title: "Non-pegged Stablecoins #01: On the Current State of HAI"
description: "This post is a rather short and non-technical evalution of HAI by a rather self-taught market participant who's almost always ready to be nerdsniped by recombinant innovations in the decentralized finance's unknown waters."
publishDate: 2024-07-20
author: "Gokhan Turhan"
tags: ["finance", "art", "technology"]
category: "finance"
featured: false
readingTime: 12
excerpt: "This post is a rather short and non-technical evalution of HAI by a rather self-taught market participant who's almost always ready to be nerdsniped by recombinant innovations in the decentralized fin..."
originalUrl: "https://gokhan.substack.com/p/non-pegged-stablecoins-01-on-the"
---

This post is a rather short and non-technical evalution of HAI by a rather self-taught market participant who's almost always ready to be nerdsniped by recombinant innovations in the decentralized finance's unknown waters.

**It is by no means an investment advice.**

I also am entering the Let's Get HAI Content Grants (Season 1) with this blogpost which you can also read on [Mirror](https://gokhan.mirror.xyz/VA1TjbfWrxd71SUnAThFH4aymBBN2RL8I7-EwhNy08s?referrerAddress=0x36de990133D36d7E3DF9a820aA3eDE5a2320De71), [Paragraph](https://paragraph.xyz/@gokhan/hai?referrer=0x36de990133D36d7E3DF9a820aA3eDE5a2320De71), [Medium](https://0xgokhan.medium.com/non-pegged-stablecoins-01-on-the-current-state-of-hai-bbf5920f49c2) and [t2world](https://app.t2.world/article/clyucjujp120827321mc3wih2xcw).

# **Introduction**

HAI is a *framework* for **stablecoin systems that comes with a store of value feature**. It is a fork of RAI onto the Optimism rollup.

However, what does it even mean?

Would any average developer, or crypto-curious individual, who now and then nerdsnipes themselves into the neochibi rabbithole of crypto-economics make any sense of such statements?

In my humble opinion, most of the time, even the whiz-kiddest builder has hard time understanding basics of any cryptographically secured economics sub-domains such as stablecoin mechanisms since crypto-economics systems are ever-green and ever-emergently unbounded, if not infinite, gardens of cultural techniques.

There also exists the fact that crypto-markets participants and agents are *usually* bad at writing books that are modular in the sense that they can be tweaked in the user-interface (UI) to the needs of a given reader-learner at best.

Let's also admit that we are, most of the time, very bad at writing and publishing easily understanble reads of any length, except for several names who do their best to abstract away the complexities even though they are said to be complex narrators for almost noone usually read them slow slow in admittably necessary interest and focus.

In the end, an entire industry experiences a sort of a impostor syndrome when also regressive behaviors by those who do not even care to contribute to the collective understanding start to make up the lore.

Accordingly, crypto, especially the unified Ethereum front, might not have a [Rust book](https://doc.rust-lang.org/book/) of its own. But, individual protocols offer neat documentation for their own good.

HAI's [documentation](https://docs.letsgethai.com/detailed/intro/hai.html) is user-friendly for the developers. I have taken it serious enough both as a structured product and stablecoin pritimitive; and, am writing this blogpost for myself first—*I myself the autodidact generalist with a duo of literature degrees and a past in much-contemporaneous artistic circles.*

In the meantime, I am sharing it with you, too, for teams such as HAI are doing great job in trailblazing for systems of which our future timelines will indeed be in need.

That is, in this post, we are refraining from signalling another inverse pyramid essay full of bullet-points, and ELI5 simplicity without going too complex if not rambunctious.

It is a text for beginners who wants to dive deeper into the reasoning underlying non-pegged stablecoins through a managed float regime.

# **What is a stablecoin framework?**

The answer plainly shines in the question itself: A stablecoin framework is a framework that enables systems that bootstrap, issue, and maintain stablecoin systems.

For me, or the way I understand failure-proof systems, a stablecoin framework is a financial primitives system that enables other fintech systems that help us steer non-cooperative games into coordination games in other macro-systems where we seek for ways and technologies to break free from myriad prisoner's dilemmas for the benefit of all.

### **What is a stablecoin?**

Whereas the usual knowledge around the definition thereof is that of fiat-pegged stablecoins that reflect the underlying fiat currency's so-called real world price as in being backed up by the United States Dollar, or European Union Euro, or others such as even Korean Won, Japanese Yen, Turkish Lira and the like; stablecoins are not necessarily pegged to a single static unit of price.

That is to say, there are different categories of stablecoins such as the pegged ones that track real world assets, or non-pegged ones that track managed float systems of any basket item or singular collaterals.

A stablecoin is not necessarily a digital asset that track any real world *currency*. It can be made up of different collaterals, too.

Usually, a stablecoin system is backed by proof-of-reserves where issuers hold a corresponding collateral of real world currencies as in the cases of [USDC](https://www.circle.com/en/transparency) by Circle, or [USDT](https://tether.to/en/transparency/?tab=usdt) of Tether. For these type so-calledly hard-pegged fiat-backed currencies are issued by private entities, we also see decentralized attempts at stable coin markets such as rather soft-pegged [DAI](https://makerdao.com/en/) by MakerDAO which is backed by multi-collateral vaults ranging from crypto-currencies to treasury bills and the like.

Thanks to the recent proliferation of real-world asset ([RWA](https://rwa.xyz/)) tokenization proliferation stemming from collaboration amongst all-embracing crypto-economics initiatives and traditional institutions that are open to evolutionary experiments, we also witness the rise of tokenized asset based stables.

Hence, we can state that a single unit of a stablecoin can designate an ownership of any single unit of either synthetic digital currencies on either a hard or soft-peg, or precious metals such as gold, or shares in a tokenized RWA product. That is, we shall not mere understand a stable is either only USD or EUR or the like.

## **What is HAI?**

**Systems Interlude**

However, it'd be nice to recall that whereas crypto-economics based financial primitive experiments can offer practical solutions to bottlenecks in the world of traditional finance especially regarding settlements, transfers etc. for both institutions and the average sovereign citizen; we shall also remind ourselves of the fact that the cryptographically secured technologies in alignment with the blockchain ecosystems are, as in the [words](https://medium.com/@virgilgr/ethereum-is-game-changing-technology-literally-d67e01a01cf8) of Dr. Griffith, enabling technologies that we are yet to understand. Ours is a roadmap to civilizational scale cooperative games by "*gamewarping*."

In this direction, we have witness many an attempt at the ideal stablecoin systems solution ranging from not-so-successful and greed'n froth fueled self-imploding algorithmic stablecoins to other multi-collateral initiatives, the majority of which have left the markets by causing unprecedented economics-design and financial technology chaos, if not utter depression of inadvertently manipulated retail investors who were made to believe that treating stablecoins as volatile instruments of speculation were a good idea. It was not. &, these were only the tip of the iceberg since as those who are well-versed might recall, people were designing ultimately degenerous stablecoin systems across Telegram and Discord group hubs only to be forgotten within a day—to crack a joke, we can attest that these degen stables were the first carnivals of the so-called time-based crypto-media with, however, shorter times of per block time of existence.

We can also herein attest to the honest trials by rather honest teams who ended up losing their game contracts with the society because of either bad timing or not so robust economic designs.

In this regard, HAI is a commentary, and upgrade on a variety of multi-collateral stablecoin experiments such as DAI and single-crypto-backed ones RAI; the latter being its architectural foundation by techniques, contracts, and the overall systemic approach.

In this line of elaboration, it's then wise to revisit what RAI is, so that we can evaluate HAI better.

### **What is RAI?**

According to Dankrad Feist [post](https://dankradfeist.de/ethereum/2023/01/31/rai-crypto-experiment.html?source=post_page-----319fe53a8a0e--------------------------------) from 2023, "RAI is one of the coolest experiments in crypto […]." RAI is a stablecoin on the Ethereum mainnet that anyone can mint by supplying collateral denominated in ether. That is, it's a crypto-currency-backed managed float regime stablecoin which is not pegged to any fiat currency. Remember that multi-colletral currencies that use any basket of assets such as either RWAs, or fiat-backed stablecoins—to put it simply—are still either hard- or soft-pegged to certain assets such as USD, or any other national currency, or precious metals like gold.

Under a managed float regime (dirty float from now on), an assets price is techniquely allowed to fluctuate between calculated price bands. The system thereof focuses on the supply and demand. The price is mathematically manipulated via an interest rate adjustment through a market price and a redemption price.

Both RAI and HAI employs this technique with some protocol differences towards varying ends. We'll be delving into details of these under the following sections related to HAI.

RAI's framework is named after Douglas Hofstadder's seminal work GEB, that is, *[Gödel, Escher, Bach: An Eternal Golden Braid](https://openlibrary.org/books/OL4097086M/Go%CC%88del_Escher_Bach)*. Avid readers might already allude to the mastery of conceptualization here. However, this time, i'll put my literary critique self aside.

### **What is GEB?**

[GEB](https://docs.reflexer.finance/ungovernance/governance-minimization-guide) is a stablecoin framework that RAI uses as developed by Reflexer Labs, and on which you can appropriate or remix novel stablecoin systems since it's open source. The overall protocol goals include introducing the [control theory](https://en.wikipedia.org/wiki/Control_theory) into stablecoin ecosystems through a [Money God League](https://ameensol.medium.com/a-money-god-raises-rai-is-live-on-ethereum-mainnet-f9aff2b1d331) and governance minimization where anthropic trust overhang leaves it all in the most viable fashion to automated organizational smart contractual infrastructures.

Minimized trust via maximal verification

Control theory in praxis

Dirty float

What do we get from here? We are building our own money pantheon where each and every Kobol colony can find [a pattern language](https://www.patternlanguage.com/) for their corresponding economies.

Stablecoin systems such as RAI can be utilized for both individual and collective ends with which it's possible to hedge against collateral volatility, tap into programmable yields—that in actual work, and those who like to dip on the 5D-chess dancefloor can re-use RAI as a collateral for other DeFi derivatives. If you are a bit familiar with staking and re-staking, yes you are on it.

However, herein, that which genuinely matters is that we are tangibly memeing a money monk who travels into the unexplored corners of heretofore unbeknownst financial tool-beings; that is, we are exploring the unknown universal boundaries of stability, store of value, and digital money.

### **OK, HAI**

HAI builds upon RAI. The key [differences](https://docs.letsgethai.com/detailed/intro/hai.html) between RAI's GEB and HAI as protocols can be summed simply as such:

HAI focuses on multi-collaterability—yes, I just made up that term—where multiple collateral asset types enables a larger space for applicability

Better contract interactions for reliability and efficiency

Pre-built contract factories that reduce the initial workload

Streamlined upgradability and deployments

Refinement of system parameters management

It is a fine example of recombinant innovation at the systems level. Though it would be really neat to delve into the specifics of the entire architecture here, it'd be wasting your time since HAI's documentation is as neat as the Rust Language book. If you are at least an intermediate DeFi aficionado, you can appreciate the documentation.

Hence, in the remainder of this post, we'll be focusing on how HAI, and hence RAI, price mechanism works, and what on earth is that PID/ PI controller is.

### **Understanding HAI Pricing**

It's crucial that we need to remember that HAI price is manipulated as aforementioned through a dirty float, that is, a managed float system. Dirty as an adjective here is not negative, and reflects only the colloquial terminology thereof. In clean floats, the volatility happens without any intervention. However, as alluded, HAI aims to warp the stablecoin game sandbox environment by offering a control-theory enabled economy. It derives the key features from RAI Reflex Index's GEB protocol.

Here, we have two relevant prices that allows soft volatility towards a systemic money market wherein it's possible to offer rather liberated stablecoin economies that fulfill the ethos and mechanics of efficient decentralization. Yet, since behavioral economics rule the game, and as in my humble opinion, stables reflect a sort of a prediction market of a sort into the uncanny wisdom of crowds, we end up witnessing the development of non-pegged stablecoin protocols as these.

HAI, just like RAI, have two prices:

**Market price**

The market price in the case of HAI is the price at which HAI token is traded on any secondary crypto-currency market. The market price can be higher, or lower than the redemption price at any given time where protocol revalues or devalues the given price to reach a desired value through a supply-demand mechanism enabled by a certain redemption rate.

**Redemption price**

The redemption is the price which is aimed by the protocol to stabilize the value of HAI at a target value in line with the market price. This price is aligned through a redemption rate. Redemption rate is sort of an interest rate in the market books that is applied to the price. That is, instead of charging directly into your position, the price is manipulated.

But why do we have two prices here? The rest of the stablecoins, except RAI, have a single price? Yes, you are correct. However, the main objective of managed float economies is to be able to reflect the market's wisdom, and create new cooperative plays to perpetuate an ecosystem of innovative markets upon which DeFi and related cyptographically self-securing idea markets can thrive. No, I am not exagerrating. Remember that RAI was better equipped to go robust during the biggest Black Swan periods in the crypto-markets all the while others were almost breaking their peg.

### **PI Controller**

[PI controller](https://commonwealth.im/lets-get-hai/discussion/22758-lets-get-hai-on-controllers) is the HAI protocol controller. It is a mechanism, a smart contractual architecture, that defines a redemption rate. The redemption rate can either be negative or positive. It's positive when the market price is below the redemption price, and is negative when the market price is above the redemption price.

You are already familiar with this system if you are a trader. You know that an interest payment is deducted from either longs or shorts in the markets depending on the error, that is discreapancy, between two positions across the overall market regarding the price of given derivative instruments such as perps.

However, with the redemption rate, the market is signalled to. Depending on the negativity or positivity thereof, the given market participants are conditioned to mint, market-buy or market-sell HAI so that the pendulum keeps spinning across this topologically prodecural generative map of macro incentive sandboxes of smart contractual autonomous market-making on which previously unknown economics, socio-political incentives, arts and culture and the like can find new expansions into our quotidian reality.

## **Evolution**

When you look into the [evolution](https://fermatslibrary.com/s/shelling-out-the-origins-of-money) of money and store of value systems, there is a pattern language: We are trying to make the best of resources into sensible units with which we can play a game of life, and evolve together by bending entropy towards our own needs.

Today, we are at the verge of escaping the longevity velocity, come up with a myriad of solutions to [X-risk scenarios](https://streameth.org/watch?event=zuconnect_istanbul__neurotech_track&session=65b8f8d4a5b2d09b88ec1777), and co-evolve into a higher plane of existence as mechanomically as it gets with non-human agents, to put it anthropically beauteously, blossoming.

The DeFi as we know it is almost a decade old in an economy where trail-blazer systems architectures such as Ethereum is unfolding its own roadmap thanks to human + smart contract collaborations into an [agentic](https://agenticmarkets.xyz/) state of markets, and the first examplaries of stablecoins systems builders are undergoing many a different experiments to find solutions to questions that we know will exist.

That's why I myself perceive experiments such as HAI as cultural movements that transcend mere financial ecologies. The evolution of money is intricately correlated with the biological evolution of humans.