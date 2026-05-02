const CREDIT_COSTS = {
  mode: { html: 1, url: 1, zip: 2, github: 3 },
  outputBoth: 1,
  options: {
    signedApk: 2, offlineSupport: 1, pushNotifications: 2,
    submitToPlayStore: 5, icon: 1, splashScreen: 1, useOwnKeystore: 0,
  },
};
const BUILD_TIMEOUT_MS     = 15 * 60 * 1000;
const ARTIFACT_EXPIRY_DAYS = 30;
const PLANS = {
  free:    { name:'Free',    monthlyBuilds:5,   concurrentBuilds:1,  requestsPerMin:10,  watermark:true,  price_ugx:0      },
  starter: { name:'Starter', monthlyBuilds:30,  concurrentBuilds:2,  requestsPerMin:20,  watermark:false, price_ugx:30000  },
  builder: { name:'Builder', monthlyBuilds:100, concurrentBuilds:5,  requestsPerMin:30,  watermark:false, price_ugx:75000  },
  pro:     { name:'Pro',     monthlyBuilds:300, concurrentBuilds:10, requestsPerMin:60,  watermark:false, price_ugx:150000 },
  agency:  { name:'Agency',  monthlyBuilds:-1,  concurrentBuilds:-1, requestsPerMin:120, watermark:false, price_ugx:300000 },
};
const CREDIT_PACKS = [
  { id:'starter_pack', credits:1000,  price_ugx:12000, label:'Starter Pack' },
  { id:'builder_pack', credits:3000,  price_ugx:25000, label:'Builder Pack' },
  { id:'pro_pack',     credits:5000,  price_ugx:35000, label:'Pro Pack'     },
  { id:'studio_pack',  credits:10000, price_ugx:60000, label:'Studio Pack'  },
];
const BUILD_STATUS = {
  QUEUED:'queued', CLONING:'cloning', BUILDING:'building', PACKAGING:'packaging',
  UPLOADING:'uploading', SUCCESS:'success', FAILED:'failed', CANCELLED:'cancelled', EXPIRED:'expired',
};
const OUTPUT_FORMAT = { APK:'apk', AAB:'aab', BOTH:'both' };
const SIGNUP_BONUS_CREDITS = 3;
module.exports = { CREDIT_COSTS, BUILD_TIMEOUT_MS, ARTIFACT_EXPIRY_DAYS, PLANS, CREDIT_PACKS, BUILD_STATUS, OUTPUT_FORMAT, SIGNUP_BONUS_CREDITS };
