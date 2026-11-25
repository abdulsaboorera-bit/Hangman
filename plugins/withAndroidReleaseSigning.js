const fs = require('fs');
const path = require('path');
const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

const SIGNING_KEYS = [
  'MYAPP_UPLOAD_STORE_FILE',
  'MYAPP_UPLOAD_KEY_ALIAS',
  'MYAPP_UPLOAD_STORE_PASSWORD',
  'MYAPP_UPLOAD_KEY_PASSWORD',
];

function readSigningProperties(projectRoot) {
  const file = path.join(projectRoot, 'keys', 'signing.properties');
  if (!fs.existsSync(file)) return null;
  const props = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z0-9_.]+)\s*=\s*(.*)$/);
    if (m) props[m[1]] = m[2];
  }
  return SIGNING_KEYS.every((k) => props[k]) ? props : null;
}

function upsertProperty(mod, key, value) {
  const idx = mod.modResults.findIndex((p) => p.type === 'property' && p.key === key);
  const entry = { type: 'property', key, value: String(value) };
  if (idx >= 0) mod.modResults[idx] = entry;
  else mod.modResults.push(entry);
}

module.exports = function withAndroidReleaseSigning(config) {
  const projectRoot = (config._internal && config._internal.projectRoot) || process.cwd();
  const signing = readSigningProperties(projectRoot);

  config = withGradleProperties(config, (mod) => {
    if (signing) {
      for (const key of SIGNING_KEYS) upsertProperty(mod, key, signing[key]);
    }
    return mod;
  });

  config = withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') return mod;
    let src = mod.modResults.contents;
    if (signing && !src.includes('MYAPP_UPLOAD_STORE_FILE')) {
      src = src.replace(
        'signingConfigs {',
        `signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }`
      );
      src = src.replace(
        /(release \{\s*\/\/ Caution![\s\S]*?signingConfig )signingConfigs\.debug/,
        "$1project.hasProperty('MYAPP_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug"
      );
      mod.modResults.contents = src;
    }
    return mod;
  });

  return config;
};
