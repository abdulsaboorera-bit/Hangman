import { Platform } from 'react-native';

let GoogleMobileAds = null;
let adComponents = null;

try {
  GoogleMobileAds = require('react-native-google-mobile-ads');
  adComponents = GoogleMobileAds;
} catch {
  GoogleMobileAds = null;
  adComponents = null;
}

const TestIds = adComponents?.TestIds || {};

let adsReady = false;
let adsRemoved = false;
let interstitial = null;
let rewarded = null;
let appOpen = null;
let appOpenLoaded = false;
let appOpenShownThisLaunch = false;
let interstitialLoaded = false;
let rewardedLoaded = false;
let roundsSinceInterstitial = 0;
const INTERSTITIAL_EVERY_N_ROUNDS = 3;

export const ADS_AVAILABLE = !!adComponents;

export const AD_UNIT_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-6411907374092424/8924163048',
    ios: 'ca-app-pub-3940256099942544/2934735716',
    default: TestIds.BANNER || 'ca-app-pub-3940256099942544/6300978111',
  }),
  interstitial: Platform.select({
    android: 'ca-app-pub-6411907374092424/4085808870',
    ios: 'ca-app-pub-3940256099942544/4411468910',
    default: TestIds.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712',
  }),
  rewarded: Platform.select({
    android: 'ca-app-pub-6411907374092424/2805030146',
    ios: 'ca-app-pub-3940256099942544/1712485313',
    default: TestIds.REWARDED || 'ca-app-pub-3940256099942544/5224354917',
  }),
  appOpen: Platform.select({
    android: 'ca-app-pub-6411907374092424/6552703460',
    ios: 'ca-app-pub-3940256099942544/5575463023',
    default: TestIds.APP_OPEN || 'ca-app-pub-3940256099942544/9257395921',
  }),
};

export const BannerAd = adComponents?.BannerAd || (() => null);
export const BannerAdSize = adComponents?.BannerAdSize || {
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
};

export async function initAds() {
  if (adsReady || !ADS_AVAILABLE) return;
  try {
    await GoogleMobileAds.default().initialize();
    adsReady = true;
    preloadInterstitial();
    preloadRewarded();
    preloadAppOpen();
  } catch {
    adsReady = false;
  }
}

function preloadAppOpen() {
  if (!adsReady || adsRemoved || !adComponents?.AppOpenAd || appOpen) return;
  try {
    appOpen = adComponents.AppOpenAd.createForAdRequest(AD_UNIT_IDS.appOpen, {
      requestNonPersonalizedAdsOnly: true,
    });
    appOpenLoaded = false;
    appOpen.addAdEventListener(adComponents.AdEventType.LOADED, () => {
      appOpenLoaded = true;
      maybeShowAppOpen();
    });
    appOpen.addAdEventListener(adComponents.AdEventType.ERROR, () => {
      appOpenLoaded = false;
    });
    appOpen.addAdEventListener(adComponents.AdEventType.CLOSED, () => {
      appOpenShownThisLaunch = true;
      appOpenLoaded = false;
      appOpen = null;
    });
    appOpen.load();
  } catch {
    appOpen = null;
    appOpenLoaded = false;
  }
}

function maybeShowAppOpen() {
  if (appOpenShownThisLaunch || adsRemoved || !appOpenLoaded || !appOpen) return;
  try {
    appOpen.show();
    appOpenShownThisLaunch = true;
  } catch {
    // activity not ready — keep ad for a later session start
  }
}

export function setAdsRemoved(removed) {
  adsRemoved = !!removed;
}

export function getAdsRemoved() {
  return adsRemoved;
}

function preloadInterstitial() {
  if (!adsReady || adsRemoved || !adComponents) return;
  try {
    interstitial = adComponents.InterstitialAd.createForAdRequest(
      AD_UNIT_IDS.interstitial,
      { requestNonPersonalizedAdsOnly: true }
    );
    interstitialLoaded = false;
    interstitial.addAdEventListener(adComponents.AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitial.addAdEventListener(adComponents.AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      preloadInterstitial();
    });
    interstitial.addAdEventListener(adComponents.AdEventType.ERROR, () => {
      interstitialLoaded = false;
    });
    interstitial.load();
  } catch {
    interstitialLoaded = false;
  }
}

function preloadRewarded() {
  if (!adsReady || adsRemoved || !adComponents) return;
  try {
    rewarded = adComponents.RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });
    rewardedLoaded = false;
    rewarded.addAdEventListener(adComponents.RewardedAdEventType.LOADED, () => {
      rewardedLoaded = true;
    });
    rewarded.addAdEventListener(adComponents.AdEventType.CLOSED, () => {
      rewardedLoaded = false;
      preloadRewarded();
    });
    rewarded.addAdEventListener(adComponents.AdEventType.ERROR, () => {
      rewardedLoaded = false;
    });
    rewarded.load();
  } catch {
    rewardedLoaded = false;
  }
}

export function isInterstitialLoaded() {
  return interstitialLoaded && !adsRemoved;
}

export function isRewardedLoaded() {
  return rewardedLoaded && !adsRemoved;
}

export function showInterstitialIfDue() {
  if (adsRemoved || !adsReady) return false;
  roundsSinceInterstitial += 1;
  if (roundsSinceInterstitial < INTERSTITIAL_EVERY_N_ROUNDS) return false;
  if (!interstitialLoaded || !interstitial) return false;
  try {
    interstitial.show();
    roundsSinceInterstitial = 0;
    return true;
  } catch {
    return false;
  }
}

export function showRewarded(onReward) {
  return new Promise((resolve) => {
    if (adsRemoved || !adsReady || !rewardedLoaded || !rewarded || !adComponents) {
      resolve(false);
      return;
    }
    let earned = false;
    const unsubEarn = rewarded.addAdEventListener(
      adComponents.RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
        onReward?.();
      }
    );
    const unsubClosed = rewarded.addAdEventListener(
      adComponents.AdEventType.CLOSED,
      () => {
        unsubEarn();
        unsubClosed();
        resolve(earned);
      }
    );
    try {
      rewarded.show();
    } catch {
      unsubEarn();
      unsubClosed();
      resolve(false);
    }
  });
}

export function resetInterstitialCounter() {
  roundsSinceInterstitial = 0;
}
