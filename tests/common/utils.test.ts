import {flattenObject} from "../../lib/common/utils";


test('flattenObject function', () => {
  // noinspection SpellCheckingInspection
  const content = {
    'modules/store-locator/store-locator': {
      css: 'modules/store-locator/store-locator.ebfc048bd09614a1089f.min.css',
      js: 'modules/store-locator/store-locator.63ed7c2e196ec6bfd008.min.js',
      ttf: 'fonts/selfstock-icons.341767e04dc720bbde7b.ttf',
      woff2: 'fonts/selfstock-icons.98e0fa111393f2ee3c52.woff2',
      eot: 'fonts/selfstock-icons.c1e498425a4e30124e31.eot',
      woff: 'fonts/selfstock-icons.cd1ec050d0e25abe6ea8.woff',
      svg: 'icons/selfstock-icons.818862173a050d0c61dc.svg'
    },
    'modules/vendor-page/product-grid': {
      css: 'modules/vendor-page/product-grid.3e077b0f7bff4779bbeb.min.css',
      js: 'modules/vendor-page/product-grid.26372fe8d111aca7e7b3.min.js',
      ttf: 'fonts/selfstock-icons.341767e04dc720bbde7b.ttf',
      woff2: 'fonts/selfstock-icons.98e0fa111393f2ee3c52.woff2',
      eot: 'fonts/selfstock-icons.c1e498425a4e30124e31.eot',
      woff: 'fonts/selfstock-icons.cd1ec050d0e25abe6ea8.woff',
      svg: [
        'icons/access-2.c7f49397f168af303f02.svg',
        'icons/access.d81518ef03a29fe127c1.svg',
        'icons/container.66cf2fa6e451cb582e53.svg',
        'icons/drive-access.0d79cbaf194883cf1029.svg',
        'icons/indoor-stairs.5934345ddf9a0cca81ed.svg',
        'icons/indoor.e8a7959800d7bf19c763.svg',
        'icons/outdoor.cf8c8ca50d1fcf23f7ab.svg',
        'icons/selfstock-icons.818862173a050d0c61dc.svg'
      ]
    },
    'modules/vendor-page/single-product': {
      css: 'modules/vendor-page/single-product.9798c087aad720690c82.min.css',
      js: 'modules/vendor-page/single-product.2957559d163175b6a972.min.js'
    },
    'modules/checkout/checkout-controller': {
      css: 'modules/checkout/checkout-controller.b048ab3f8a70d6886033.min.css',
      js: 'modules/checkout/checkout-controller.510963526eb1c511748b.min.js'
    },
    '': {
      js: [
        'vendors-node_modules_swiper_swiper_esm_js.b6c989a9492c10f7b5fd.chunk.min.js',
        'vendors-node_modules_animejs_lib_anime_es_js.599f607a5b4bdf3f048d.chunk.min.js',
        'assets_TypeScript_Core_GoogleMapRichMarker_ts.ec115639f7f9254d5e14.chunk.min.js'
      ]
    }
  };
  
  // noinspection SpellCheckingInspection
  expect(flattenObject(content))
    .toStrictEqual([
      'modules/store-locator/store-locator.ebfc048bd09614a1089f.min.css',
      'modules/store-locator/store-locator.63ed7c2e196ec6bfd008.min.js',
      'fonts/selfstock-icons.341767e04dc720bbde7b.ttf',
      'fonts/selfstock-icons.98e0fa111393f2ee3c52.woff2',
      'fonts/selfstock-icons.c1e498425a4e30124e31.eot',
      'fonts/selfstock-icons.cd1ec050d0e25abe6ea8.woff',
      'icons/selfstock-icons.818862173a050d0c61dc.svg',
      'modules/vendor-page/product-grid.3e077b0f7bff4779bbeb.min.css',
      'modules/vendor-page/product-grid.26372fe8d111aca7e7b3.min.js',
      'fonts/selfstock-icons.341767e04dc720bbde7b.ttf',
      'fonts/selfstock-icons.98e0fa111393f2ee3c52.woff2',
      'fonts/selfstock-icons.c1e498425a4e30124e31.eot',
      'fonts/selfstock-icons.cd1ec050d0e25abe6ea8.woff',
      'icons/access-2.c7f49397f168af303f02.svg',
      'icons/access.d81518ef03a29fe127c1.svg',
      'icons/container.66cf2fa6e451cb582e53.svg',
      'icons/drive-access.0d79cbaf194883cf1029.svg',
      'icons/indoor-stairs.5934345ddf9a0cca81ed.svg',
      'icons/indoor.e8a7959800d7bf19c763.svg',
      'icons/outdoor.cf8c8ca50d1fcf23f7ab.svg',
      'icons/selfstock-icons.818862173a050d0c61dc.svg',
      'modules/vendor-page/single-product.9798c087aad720690c82.min.css',
      'modules/vendor-page/single-product.2957559d163175b6a972.min.js',
      'modules/checkout/checkout-controller.b048ab3f8a70d6886033.min.css',
      'modules/checkout/checkout-controller.510963526eb1c511748b.min.js',
      'vendors-node_modules_swiper_swiper_esm_js.b6c989a9492c10f7b5fd.chunk.min.js',
      'vendors-node_modules_animejs_lib_anime_es_js.599f607a5b4bdf3f048d.chunk.min.js',
      'assets_TypeScript_Core_GoogleMapRichMarker_ts.ec115639f7f9254d5e14.chunk.min.js'
    ]);
});