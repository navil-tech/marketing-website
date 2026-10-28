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
