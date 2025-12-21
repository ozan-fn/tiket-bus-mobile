const { withGradleProperties, withAppBuildGradle } = require('@expo/config-plugins');

// --- KONFIGURASI ---
// Ubah daftar ABI di sini. Format string harus sesuai syntax Gradle ("abi1", "abi2")
const targetABIs = '"armeabi-v7a", "x86"';
// -------------------

const withOptProps = (config) => {
  // BAGIAN 1: Modifikasi gradle.properties
  config = withGradleProperties(config, (cfg) => {
    const set = (k, v) => {
      cfg.modResults = cfg.modResults.filter((i) => i.type === 'property' && i.key !== k);
      cfg.modResults.push({ type: 'property', key: k, value: v });
    };

    set('expo.useLegacyPackaging', 'true');
    set('android.enableMinifyInReleaseBuilds', 'true');
    // Ini mengaktifkan fitur split secara global flag
    set('android.enableShrinkResourcesInReleaseBuilds', 'true');

    // Kita hapus quotes dari targetABIs untuk gradle.properties (karena formatnya beda: a,b bukan "a","b")
    const cleanArchs = targetABIs.replace(/"/g, '').replace(/\s/g, '');
    set('reactNativeArchitectures', cleanArchs);

    return cfg;
  });

  // BAGIAN 2: Modifikasi build.gradle (app level)
  config = withAppBuildGradle(config, (cfg) => {
    const buildGradleContent = cfg.modResults.contents;

    // Cek marker unik (misal: splits) biar gak nulis dobel
    if (buildGradleContent.includes('splits {')) {
      return cfg;
    }

    // Kita cari baris "defaultConfig {"
    const pattern = /defaultConfig\s*\{/;

    // Kita siapkan kode injeksi:
    // 1. splits block (untuk memecah APK)
    // 2. defaultConfig dengan ndk abiFilters
    const replacement = `
    splits {
        abi {
            enable true
            reset()
            include ${targetABIs}
            universalApk false
        }
    }

    defaultConfig {
        // ndk {
        //     abiFilters ${targetABIs}
        // }
    `;

    // Lakukan replace: Kode di atas akan disisipkan menggantikan baris "defaultConfig {"
    // Hasilnya: splits block akan muncul tepat di atas defaultConfig
    cfg.modResults.contents = buildGradleContent.replace(pattern, replacement);

    return cfg;
  });

  return config;
};

module.exports = withOptProps;
