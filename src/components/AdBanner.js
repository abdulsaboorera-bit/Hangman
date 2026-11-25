import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, AD_UNIT_IDS, getAdsRemoved, initAds, ADS_AVAILABLE } from '../services/ads';

export default function AdBanner() {
  const [ready, setReady] = React.useState(false);
  const removed = getAdsRemoved();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!ADS_AVAILABLE) return;
      await initAds();
      if (mounted) setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (removed || !ready || !ADS_AVAILABLE) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={AD_UNIT_IDS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    minHeight: 60,
  },
});
