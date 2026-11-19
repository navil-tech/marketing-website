## [1.1.0](https://github.com/navil-tech/marketing-website/compare/v1.0.1...v1.1.0) (2026-11-19)

### Features

* **about:** rebuild the page around mission, principles and status ([3727ff2](https://github.com/navil-tech/marketing-website/commit/3727ff2fe9aa754df34f744518cfdbed4400a6a8))
* **contacts:** replace contact placeholders with the support email ([6c4a288](https://github.com/navil-tech/marketing-website/commit/6c4a2887409accfaeb611bc1caa475a8a6aa9430))
* **events:** record visits, leads and notifications as one event model ([be99aac](https://github.com/navil-tech/marketing-website/commit/be99aacf86f5c97bb8d1517b52f83a413660c6c6))
* **leads:** store region as an enum instead of the localized label ([862600f](https://github.com/navil-tech/marketing-website/commit/862600f951febb8d2597e90061cd32cb547f6aea))
* **leads:** store the first-touch label of the visitor on the lead ([7840086](https://github.com/navil-tech/marketing-website/commit/7840086ede7b8168508946c6001bb4493d4eab96))
* **reports:** add the funnel and integrity report ([22efce0](https://github.com/navil-tech/marketing-website/commit/22efce051f71b2521436c3f772f5ff0198f8a9f8))

### Bug Fixes

* **about:** use the accent color for both audience cards ([f8303ee](https://github.com/navil-tech/marketing-website/commit/f8303eeb11ecf30dbb75c736bc31be0ca5bc3c23))
* correct the brand name to navil ([7f960f8](https://github.com/navil-tech/marketing-website/commit/7f960f85cac9e72688a3fb76a6b0a92aa899a232))

### CI

* pin the runner to ubuntu-24.04 ([c76c436](https://github.com/navil-tech/marketing-website/commit/c76c436a03096af2b496533bf95de1fa6d0f883f))

## [1.0.1](https://github.com/navil-tech/marketing-website/compare/v1.0.0...v1.0.1) (2026-10-28)

### CI

* hide refactor commits from the changelog ([4739373](https://github.com/navil-tech/marketing-website/commit/473937360d1328ea1da96a2062e23722a0ffe011))
* publish a github release for every version ([380ffe4](https://github.com/navil-tech/marketing-website/commit/380ffe45e8c7c05b359cb089677ed0c87d377271))
* run release jobs one at a time ([eba4caf](https://github.com/navil-tech/marketing-website/commit/eba4caf218c9d2577120672be51fe820013fbe0b))

## 1.0.0 (2026-10-28)

### Features

* add canonical and hreflang metadata built from the production site url ([89bb117](https://github.com/navil-tech/marketing-website/commit/89bb11704cd6c0b7685c36fb4a13d0ee288c2c4a))
* add english and hebrew locales with rtl support ([78f03ca](https://github.com/navil-tech/marketing-website/commit/78f03cadfc08d9b47de06968252bd632dc1aee1f))
* add i18n dictionary, routes, theme and lead parsing helpers ([d19761a](https://github.com/navil-tech/marketing-website/commit/d19761aedf095002f303f8243dbdfb2e739ebdf5))
* add landing, about, carriers and thanks pages with lead actions ([c90ec96](https://github.com/navil-tech/marketing-website/commit/c90ec969ce570f18025abf7fb9d1efa8a0dcae24))
* add layout, landing, form and ui components ([ac696b9](https://github.com/navil-tech/marketing-website/commit/ac696b99456daa117eea045b7e2b9d9d6b03df97))
* add sitemap and robots routes ([81af405](https://github.com/navil-tech/marketing-website/commit/81af40540f9ca3720fab232a532dabf0e6bcef0f))
* **forms:** add honeypot field to lead forms ([88beb74](https://github.com/navil-tech/marketing-website/commit/88beb74c20031f56e7e98add561a26a92f704425))
* **forms:** replace consent note with a required checkbox ([3603528](https://github.com/navil-tech/marketing-website/commit/3603528830d166681ab95bc06fe0625a6d5bb4c8))
* **i18n:** make english the default locale ([5e33c88](https://github.com/navil-tech/marketing-website/commit/5e33c88eedc7d38b6a9e8d2888b643c66ea06fca))
* **leads:** store submissions in postgres with first-touch attribution ([3968d0f](https://github.com/navil-tech/marketing-website/commit/3968d0fdcdbec560120e27764f8ad7d593780de4))
* mark thanks page as noindex ([d97aa0f](https://github.com/navil-tech/marketing-website/commit/d97aa0ff14509065725ab17972328d699ce3ff66))
* migrate i18n to next-intl with locale routing ([e68ec8d](https://github.com/navil-tech/marketing-website/commit/e68ec8d6fdc2ab7542729a1caff1a7648567c2a7))

### Bug Fixes

* center svg icons in theme toggle and header logo ([9f87c30](https://github.com/navil-tech/marketing-website/commit/9f87c30a86de1f130b30f3aa143e21c44cd592a4))

### Build

* add semantic-release with the conventional commits preset ([3ca395f](https://github.com/navil-tech/marketing-website/commit/3ca395f14152ce02ea8b0b401c70bb4c4edb4745))
* **deps:** bump next to 16.4.3 to fix security advisories ([f76933e](https://github.com/navil-tech/marketing-website/commit/f76933e980cf5e47a3708740ebd8c2a623a82378))
* **docker:** add standalone image with migrator and runner targets ([0ed3191](https://github.com/navil-tech/marketing-website/commit/0ed3191e62b3814c83bc13798c988640138993a3))
* **docker:** drop public copy from runner image ([e7612d7](https://github.com/navil-tech/marketing-website/commit/e7612d74987480276aeafec360af201a1f8f81d8))
* **docker:** merge migrator and runner into a single image ([dfd740f](https://github.com/navil-tech/marketing-website/commit/dfd740fc7ed487928e2754028578623075a50c96))
* **prisma:** add prisma with lead schema and local postgres compose ([290ded0](https://github.com/navil-tech/marketing-website/commit/290ded0d83fd020aea599611ae36a25d0b109d13))

### CI

* add quality, dev image and release workflow ([602f73f](https://github.com/navil-tech/marketing-website/commit/602f73f2cf319df04c9934285657954dfb2cdebd))
